import { logger } from '../utils/logger'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { LibraryItem, LibraryItemState } from '../entity/library_item'

import { Video, Client as YouTubeClient } from 'youtubei'

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

    if ('duration' in video && (video as Video).duration > 0) {
      needsUpdate = true
      libraryItem.wordCount = calculateWordCount((video as Video).duration)
    }

    if (needsUpdate) {
      const _ = await authTrx(
        async (t) => {
          return t
            .getRepository(LibraryItem)
            .update(jobData.libraryItemId, libraryItem)
        },
        undefined,
        jobData.userId
      )
    }
  } catch (err) {
    console.log('error creating summary: ', err)
  }
}
