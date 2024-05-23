import { searchLibraryItems } from '../services/library_item'
import { findUnseenPublicItems } from '../services/public_item'
import { logger } from '../utils/logger'

interface JustReadFeedUpdateData {
  userId: string
}

const selectCandidates = async (userId: string) => {
  // get last 100 library items saved and not seen by user
  const privateCandidates = await searchLibraryItems(
    {
      size: 100,
      includeContent: false,
      query: `-is:seen`,
    },
    userId
  )

  // get candidates from public inventory
  const publicCandidates = await findUnseenPublicItems(userId, {
    limit: 100,
  })

  // TODO: mix candidates
  return privateCandidates.concat(publicCandidates)
}

const updateJustReadFeed = async (data: JustReadFeedUpdateData) => {
  const { userId } = data
  logger.info(`Updating just read feed for user ${userId}`)

  const candidates = await selectCandidates(userId)
  logger.info(`Found ${candidates.length} candidates`)

  // TODO: integrity check on candidates?
  // TODO: rank candidates

  // TODO: prepend candidates to feed in redis
}
