import { PromptTemplate } from '@langchain/core/prompts'
import { OpenAI } from '@langchain/openai'
import { parseHTML } from 'linkedom'
import showdown from 'showdown'
import { Chapter, Client as YouTubeClient } from 'youtubei'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import {
  findLibraryItemById,
  updateLibraryItem,
} from '../services/library_item'
import { OPENAI_MODEL } from '../utils/ai'
import { enqueueProcessYouTubeTranscript } from '../utils/createTask'
import { stringToHash } from '../utils/helpers'
import { logger } from '../utils/logger'
import { parsePreparedContent } from '../utils/parser'
import {
  downloadFromBucket,
  isFileExists,
  uploadToBucket,
} from '../utils/uploads'
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
      modelName: OPENAI_MODEL,
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
  const document = parseHTML(originalHTML).document

  const rootElement = document.querySelector('#readability-page-1')
  if (!rootElement) {
    logger.warning('no readability-page-1 element found')
    return undefined
  }

  const transcriptNode =
    rootElement.querySelector('#_omnivore_youtube_transcript') ||
    rootElement.querySelector('._omnivore_youtube_transcript')

  if (transcriptNode) {
    transcriptNode.innerHTML = transcriptHTML
  } else {
    const div = document.createElement('div')
    div.innerHTML = transcriptHTML
    div.className = '_omnivore_youtube_transcript'

    const videoElement = rootElement.querySelector('#_omnivore_youtube')
    if (!videoElement) {
      logger.warning('no video element found')
      return undefined
    }

    videoElement.appendChild(div)
  }

  const preparedDocument = {
    document: `<html><body>${rootElement.innerHTML}</body></html>`,
    pageInfo: {},
  }
  const updatedContent = await parsePreparedContent(
    originalUrl,
    preparedDocument,
    true
  )
  return updatedContent.parsedContent?.content
}

const fetchCachedYouTubeTranscript = async (
  videoId: string,
  transcriptHash: string,
  promptHash: string
): Promise<string | undefined> => {
  try {
    const filePath = `youtube-transcripts/${videoId}/${transcriptHash}.${promptHash}.html`
    const exists = await isFileExists(filePath)
    if (!exists) {
      logger.info(`cached transcript not found: ${filePath}`)
      return undefined
    }

    const buffer = await downloadFromBucket(filePath)
    return buffer.toString()
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
  await uploadToBucket(
    `youtube-transcripts/${videoId}/${transcriptHash}.${promptHash}.html`,
    Buffer.from(transcript)
  )
}

export const processYouTubeVideo = async (
  jobData: ProcessYouTubeVideoJobData
) => {
  const libraryItem = await findLibraryItemById(
    jobData.libraryItemId,
    jobData.userId,
    {
      select: [
        'id',
        'originalUrl',
        'description',
        'wordCount',
        'publishedAt',
        'state',
        'readableContent',
      ],
    }
  )
  if (!libraryItem || libraryItem.state !== LibraryItemState.Succeeded) {
    logger.info(
      `Not ready to get YouTube metadata job state: ${
        libraryItem?.state ?? 'null'
      }`
    )
    return
  }

  const videoURL = new URL(libraryItem.originalUrl)
  const videoId = videoIdFromYouTubeUrl(videoURL.href)

  if (!videoId) {
    logger.warning('no video id for supplied youtube url', {
      url: libraryItem.originalUrl,
    })
    return
  }

  const updatedLibraryItem: Partial<LibraryItem> = {}
  const youtube = new YouTubeClient()
  const video = await youtube.getVideo(videoId)
  if (!video) {
    logger.warning('no video found for youtube url', {
      url: libraryItem.originalUrl,
    })
    return
  }

  if (video.description && libraryItem.description !== video.description) {
    updatedLibraryItem.description = video.description
  }

  let duration = -1
  if ('duration' in video && video.duration > 0) {
    updatedLibraryItem.wordCount = calculateWordCount(video.duration)
    duration = video.duration
  }

  if (video.uploadDate && !Number.isNaN(Date.parse(video.uploadDate))) {
    updatedLibraryItem.publishedAt = new Date(video.uploadDate)
  }

  if ('getTranscript' in video && duration > 0 && duration < 1801) {
    // If the video has a transcript available, put a placehold in and
    // enqueue a job to process the full transcript
    const updatedContent = await addTranscriptToReadableContent(
      libraryItem.originalUrl,
      libraryItem.readableContent,
      TRANSCRIPT_PLACEHOLDER_TEXT
    )

    if (updatedContent) {
      updatedLibraryItem.readableContent = updatedContent
    }

    await enqueueProcessYouTubeTranscript({
      videoId,
      ...jobData,
    })
  }

  if (updatedLibraryItem !== {}) {
    await updateLibraryItem(
      jobData.libraryItemId,
      updatedLibraryItem,
      jobData.userId
    )
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
  const libraryItem = await findLibraryItemById(
    jobData.libraryItemId,
    jobData.userId,
    {
      select: ['id', 'originalUrl', 'readableContent', 'state'],
    }
  )
  if (!libraryItem || libraryItem.state !== LibraryItemState.Succeeded) {
    logger.info(
      `Not ready to get YouTube metadata job state: ${
        libraryItem?.state ?? 'null'
      }`
    )
    return
  }

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
      libraryItem.readableContent,
      transcriptHTML
    )

    if (updatedContent) {
      await updateLibraryItem(
        jobData.libraryItemId,
        {
          readableContent: updatedContent,
        },
        jobData.userId
      )
    }
  }
}
