import { logger } from '../utils/logger'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { LibraryItem, LibraryItemState } from '../entity/library_item'

import { Chapter, Client as YouTubeClient } from 'youtubei'
import showdown from 'showdown'
import { parseHTML } from 'linkedom'
import { parsePreparedContent } from '../utils/parser'
import { OpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { enqueueProcessYouTubeTranscript } from '../utils/createTask'

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

export const createTranscriptHTML = async (
  transcript: TranscriptProperties[]
): Promise<string> => {
  let transcriptMarkdown = ''
  if (process.env.YOUTUBE_TRANSCRIPT_PROMPT && process.env.OPENAI_API_KEY) {
    const llm = new OpenAI({
      modelName: 'gpt-4',
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    })
    const promptTemplate = PromptTemplate.fromTemplate(
      `${process.env.YOUTUBE_TRANSCRIPT_PROMPT}

       {transcriptData}`
    )
    const chain = promptTemplate.pipe(llm)

    let transcriptChunkLength = 0
    let transcriptChunk: TranscriptProperties[] = []
    for (const item of transcript) {
      if (transcriptChunkLength + item.text.length > 8000) {
        const result = await chain.invoke({
          transcriptData: transcriptChunk.map((item) => item.text).join(' '),
        })

        transcriptMarkdown += result

        transcriptChunk = []
        transcriptChunkLength = 0
      }

      transcriptChunk.push(item)
      transcriptChunkLength += item.text.length
    }

    if (transcriptChunk.length > 0) {
      const result = await chain.invoke({
        transcriptData: transcriptChunk.map((item) => item.text).join(' '),
      })

      transcriptMarkdown += result
    }
  }

  // If the LLM didn't give us enough data fallback to the raw template
  if (transcriptMarkdown.length < 1) {
    transcriptMarkdown = transcript.map((item) => item.text).join(' ')
  }

  const converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
  })
  return converter.makeHtml(transcriptMarkdown)
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

export const processYouTubeVideo = async (
  jobData: ProcessYouTubeVideoJobData
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

    const u = new URL(libraryItem.originalUrl)
    const videoId = u.searchParams.get('v')

    if (!videoId) {
      console.warn('no video id for supplied youtube url', {
        url: libraryItem.originalUrl,
      })
      return
    }

    let needsUpdate = false
    const youtube = new YouTubeClient()
    const video = await youtube.getVideo(videoId)
    if (!video) {
      console.warn('no video found for youtube url', {
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
        console.warn('could not updated library item')
      }
    }
  } catch (err) {
    console.warn('error creating summary: ', err)
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
      logger.warn('no video found for youtube url', {
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
      const transcriptHTML = await createTranscriptHTML(transcript)
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
        console.warn('could not updated library item')
      }
    }
  } catch (err) {
    console.warn('error creating summary: ', err)
  }
}
