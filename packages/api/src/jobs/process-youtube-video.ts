import { Storage } from '@google-cloud/storage'
import { PromptTemplate } from '@langchain/core/prompts'
import { OpenAI } from '@langchain/openai'
import { parseHTML } from 'linkedom'
import showdown from 'showdown'
import * as stream from 'stream'
import { Chapter, Client as YouTubeClient } from 'youtubei'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { env } from '../env'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { FeatureName, findGrantedFeatureByName } from '../services/features'
import { enqueueProcessYouTubeTranscript } from '../utils/createTask'
import { stringToHash } from '../utils/helpers'
import { logger } from '../utils/logger'
import { parsePreparedContent } from '../utils/parser'
import { videoIdFromYouTubeUrl } from '../utils/youtube'

export interface ProcessYouTubeVideoJobData {
  userId: string
  libraryItemId: string
}

export const PROCESS_YOUTUBE_VIDEO_JOB_NAME = 'process-youtube-video'
export const PROCESS_YOUTUBE_TRANSCRIPT_JOB_NAME = 'process-youtube-transcript'

const TRANSCRIPT_PLACEHOLDER_TEXT =
  '* Omnivore is preparing a transcript for this video'

const calculateWordCount = (durationInSeconds: number): number => {
  // Calculate word count using the formula: word count = read time (in seconds) * words per second
  // Assuming average reading speed is 235 words per minute (or about 3.92 words per second)
  const wordsPerSecond = 3.92
  const wordCount = Math.round(durationInSeconds * wordsPerSecond)
  return wordCount
}

interface ChapterProperties {
  title: string
  start: number
}

interface TranscriptProperties {
  text: string
  start: number
  duration: number
}

export const addTranscriptChapters = (
  chapters: ChapterProperties[],
  transcript: TranscriptProperties[]
): TranscriptProperties[] => {
  chapters.sort((a, b) => a.start - b.start)

  for (const chapter of chapters) {
    const startOffset = chapter.start
    const title = '\n\n## ' + chapter.title + '\n\n'

    const index = transcript.findIndex(
      (textItem) => textItem.start > startOffset
    )

    if (index !== -1) {
      transcript.splice(index, 0, {
        text: title,
        duration: 1,
        start: startOffset,
      })
    } else {
      transcript.push({ text: title, duration: 0, start: startOffset })
    }
  }
  return transcript
}

const createTranscriptHash = (transcript: TranscriptProperties[]): string => {
  const rawTranscript = transcript.map((item) => item.text).join(' ')
  return stringToHash(rawTranscript)
}

export const createTranscriptHTML = async (
  videoId: string,
  transcript: TranscriptProperties[]
): Promise<string> => {
  let transcriptMarkdown = ''
  const transcriptHash = createTranscriptHash(transcript)
  const promptHash = stringToHash(process.env.YOUTUBE_TRANSCRIPT_PROMPT ?? '')

  if (process.env.YOUTUBE_TRANSCRIPT_PROMPT && process.env.OPENAI_API_KEY) {
    const cachedTranscriptHTML = await fetchCachedYouTubeTranscript(
      videoId,
      transcriptHash,
      promptHash
    )
    if (cachedTranscriptHTML) {
      return cachedTranscriptHTML
    }

    const llm = new OpenAI({
      modelName: 'gpt-4-0125-preview',
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    })
    const promptTemplate = PromptTemplate.fromTemplate(
      `${process.env.YOUTUBE_TRANSCRIPT_PROMPT}

       {transcriptData}`
    )
    const chain = promptTemplate.pipe(llm)
    const result = await chain.invoke({
      transcriptData: transcript.map((item) => item.text).join(' '),
    })

    transcriptMarkdown = result
  }

  // If the LLM didn't give us enough data fallback to the raw template
  if (transcriptMarkdown.length < 1) {
    transcriptMarkdown = transcript.map((item) => item.text).join(' ')
  }

  const converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
  })
  const transcriptHTML = converter.makeHtml(transcriptMarkdown)

  if (process.env.YOUTUBE_TRANSCRIPT_PROMPT && process.env.OPENAI_API_KEY) {
    await cacheYouTubeTranscript(
      videoId,
      transcriptHash,
      promptHash,
      transcriptHTML
    )
  }

  return transcriptHTML
}

export const addTranscriptToReadableContent = async (
  originalUrl: string,
  originalHTML: string,
  transcriptHTML: string
): Promise<string | undefined> => {
  const html = parseHTML(originalHTML)

  const transcriptNode = html.document.querySelector(
    '#_omnivore_youtube_transcript'
  )

  if (transcriptNode) {
    transcriptNode.innerHTML = transcriptHTML
  } else {
    const div = html.document.createElement('div')
    div.innerHTML = transcriptHTML
    html.document.body.appendChild(div)
  }

  const preparedDocument = {
    document: html.document.toString(),
    pageInfo: {},
  }
  const updatedContent = await parsePreparedContent(
    originalUrl,
    preparedDocument,
    true
  )
  return updatedContent.parsedContent?.content
}

export const addTranscriptPlaceholdReadableContent = async (
  originalUrl: string,
  originalHTML: string
): Promise<string | undefined> => {
  const html = parseHTML(originalHTML)

  const transcriptNode = html.document.querySelector(
    '#_omnivore_youtube_transcript'
  )

  if (transcriptNode) {
    transcriptNode.innerHTML = TRANSCRIPT_PLACEHOLDER_TEXT
  } else {
    const div = html.document.createElement('div')
    div.innerHTML = TRANSCRIPT_PLACEHOLDER_TEXT
    html.document.body.appendChild(div)
  }

  const preparedDocument = {
    document: html.document.toString(),
    pageInfo: {},
  }
  const updatedContent = await parsePreparedContent(
    originalUrl,
    preparedDocument,
    true
  )
  return updatedContent.parsedContent?.content
}

async function readStringFromStorage(
  bucketName: string,
  fileName: string
): Promise<string | undefined> {
  try {
    const storage = env.fileUpload?.gcsUploadSAKeyFilePath
      ? new Storage({ keyFilename: env.fileUpload.gcsUploadSAKeyFilePath })
      : new Storage()

    const existsResponse = await storage
      .bucket(bucketName)
      .file(fileName)
      .exists()
    const exists = existsResponse[0]

    if (!exists) {
      throw new Error(
        `File '${fileName}' does not exist in bucket '${bucketName}'.`
      )
    }

    // Download the file contents as a string
    const fileContentResponse = await storage
      .bucket(bucketName)
      .file(fileName)
      .download()
    const fileContent = fileContentResponse[0].toString()
    return fileContent
  } catch (error) {
    // This isn't a catastrophic error it just means the file doesn't exist
    logger.info('Error downloading file:', error)
    return undefined
  }
}

const writeStringToStorage = async (
  bucketName: string,
  fileName: string,
  content: string
): Promise<void> => {
  try {
    const storage = env.fileUpload?.gcsUploadSAKeyFilePath
      ? new Storage({ keyFilename: env.fileUpload.gcsUploadSAKeyFilePath })
      : new Storage()

    const writableStream = storage
      .bucket(bucketName)
      .file(fileName)
      .createWriteStream()

    // Convert the string content to a readable stream
    const readableStream = new stream.Readable()
    readableStream.push(content)
    readableStream.push(null) // Signal the end of the stream

    // Pipe the readable stream to the writable stream to upload the file content
    await new Promise((resolve, reject) => {
      readableStream
        .pipe(writableStream)
        .on('finish', resolve)
        .on('error', reject)
    })

    logger.info(
      `File '${fileName}' uploaded successfully to bucket '${bucketName}'.`
    )
  } catch (error) {
    logger.error('Error uploading file:', error)
    throw error
  }
}

const fetchCachedYouTubeTranscript = async (
  videoId: string,
  transcriptHash: string,
  promptHash: string
): Promise<string | undefined> => {
  const bucketName = env.fileUpload.gcsUploadBucket

  try {
    return await readStringFromStorage(
      bucketName,
      `youtube-transcripts/${videoId}/${transcriptHash}.${promptHash}.html`
    )
  } catch (err) {
    logger.info(`unable to fetch cached transcript`, { error: err })
  }

  return undefined
}

const cacheYouTubeTranscript = async (
  videoId: string,
  transcriptHash: string,
  promptHash: string,
  transcript: string
): Promise<void> => {
  const bucketName = env.fileUpload.gcsUploadBucket

  try {
    await writeStringToStorage(
      bucketName,
      `youtube-transcripts/${videoId}/${transcriptHash}.${promptHash}.html`,
      transcript
    )
  } catch (err) {
    logger.info(`unable to cache transcript`, { error: err })
  }
}

export const processYouTubeVideo = async (
  jobData: ProcessYouTubeVideoJobData
) => {
  let videoURL: URL | undefined
  try {
    const libraryItem = await authTrx(
      async (tx) =>
        tx
          .withRepository(libraryItemRepository)
          .findById(jobData.libraryItemId),
      undefined,
      jobData.userId
    )
    if (
      !libraryItem ||
      libraryItem.state !== LibraryItemState.Succeeded ||
      !libraryItem.originalContent
    ) {
      logger.info(
        `Not ready to get YouTube metadata job state: ${
          libraryItem?.state ?? 'null'
        }`
      )
      return
    }

    videoURL = new URL(libraryItem.originalUrl)
    const videoId = videoIdFromYouTubeUrl(libraryItem.originalUrl)

    if (!videoId) {
      logger.warning('no video id for supplied youtube url', {
        url: libraryItem.originalUrl,
      })
      return
    }

    let needsUpdate = false
    const youtube = new YouTubeClient()
    const video = await youtube.getVideo(videoId)
    if (!video) {
      logger.warning('no video found for youtube url', {
        url: libraryItem.originalUrl,
      })
      return
    }

    if (video.description && libraryItem.description !== video.description) {
      needsUpdate = true
      libraryItem.description = video.description
    }

    let duration = -1
    if ('duration' in video && video.duration > 0) {
      needsUpdate = true
      libraryItem.wordCount = calculateWordCount(video.duration)
      duration = video.duration
    }

    if (video.uploadDate && !Number.isNaN(Date.parse(video.uploadDate))) {
      needsUpdate = true
      libraryItem.publishedAt = new Date(video.uploadDate)
    }

    if (
      await findGrantedFeatureByName(
        FeatureName.YouTubeTranscripts,
        jobData.userId
      )
    ) {
      if ('getTranscript' in video && duration > 0 && duration < 1801) {
        // If the video has a transcript available, put a placehold in and
        // enqueue a job to process the full transcript
        const updatedContent = await addTranscriptPlaceholdReadableContent(
          libraryItem.originalUrl,
          libraryItem.originalContent
        )

        if (updatedContent) {
          needsUpdate = true
          libraryItem.readableContent = updatedContent
        }

        await enqueueProcessYouTubeTranscript({
          videoId,
          ...jobData,
        })
      }
    }

    if (needsUpdate) {
      const updated = await authTrx(
        async (t) => {
          return t
            .getRepository(LibraryItem)
            .update(jobData.libraryItemId, libraryItem)
        },
        undefined,
        jobData.userId
      )
      if (!updated) {
        logger.warning('could not updated library item')
      }
    }
  } catch (err) {
    logger.warning('error getting youtube metadata: ', {
      err,
      jobData,
      videoURL,
    })
  }
}

export interface ProcessYouTubeTranscriptJobData {
  userId: string
  videoId: string
  libraryItemId: string
}

export const processYouTubeTranscript = async (
  jobData: ProcessYouTubeTranscriptJobData
) => {
  try {
    const libraryItem = await authTrx(
      async (tx) =>
        tx
          .withRepository(libraryItemRepository)
          .findById(jobData.libraryItemId),
      undefined,
      jobData.userId
    )
    if (
      !libraryItem ||
      libraryItem.state !== LibraryItemState.Succeeded ||
      !libraryItem.originalContent
    ) {
      logger.info(
        `Not ready to get YouTube metadata job state: ${
          libraryItem?.state ?? 'null'
        }`
      )
      return
    }

    let needsUpdate = false
    const youtube = new YouTubeClient()
    const video = await youtube.getVideo(jobData.videoId)
    if (!video) {
      logger.warning('no video found for youtube url', {
        url: libraryItem.originalUrl,
      })
      return
    }

    let chapters: Chapter[] = []
    if ('chapters' in video) {
      chapters = video.chapters
    }

    let transcript: TranscriptProperties[] | undefined = undefined
    if ('getTranscript' in video) {
      transcript = await video.getTranscript()
    }

    if (transcript) {
      if (chapters) {
        transcript = addTranscriptChapters(chapters, transcript)
      }
      const transcriptHTML = await createTranscriptHTML(
        jobData.videoId,
        transcript
      )
      const updatedContent = await addTranscriptToReadableContent(
        libraryItem.originalUrl,
        libraryItem.originalContent,
        transcriptHTML
      )

      if (updatedContent) {
        needsUpdate = true
        libraryItem.readableContent = updatedContent
      }
    }

    if (needsUpdate) {
      const updated = await authTrx(
        async (t) => {
          return t
            .getRepository(LibraryItem)
            .update(jobData.libraryItemId, libraryItem)
        },
        undefined,
        jobData.userId
      )
      if (!updated) {
        logger.warning('could not updated library item')
      }
    }
  } catch (err) {
    logger.warning('error getting youtube transcript: ', { err, jobData })
  }
}
