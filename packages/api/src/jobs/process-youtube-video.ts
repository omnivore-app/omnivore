import { logger } from '../utils/logger'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { LibraryItem, LibraryItemState } from '../entity/library_item'

import { Chapter, Client as YouTubeClient } from 'youtubei'

export interface ProcessYouTubeVideoJobData {
  userId: string
  libraryItemId: string
}

export const PROCESS_YOUTUBE_VIDEO_JOB_NAME = 'process-youtube-video'

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
    const title = '## ' + chapter.title + '\n\n'

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
    if (!libraryItem || libraryItem.state !== LibraryItemState.Succeeded) {
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

    if ('duration' in video && video.duration > 0) {
      needsUpdate = true
      libraryItem.wordCount = calculateWordCount(video.duration)
    }

    let chapters: Chapter[] = []
    if ('chapters' in video) {
      chapters = video.chapters
      console.log('video.chapters: ', video.chapters)
    }

    let transcript: TranscriptProperties[] | undefined = undefined
    if ('getTranscript' in video) {
      transcript = await video.getTranscript()
      console.log('transcript: ', transcript)
    }

    if (transcript) {
      if (chapters) {
        transcript = addTranscriptChapters(chapters, transcript)
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
