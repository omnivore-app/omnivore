import { findThumbnail } from '../jobs/find_thumbnail'
import { applyRules } from '../jobs/apply_rules'
import { labelRepository } from '../repository/label'
import { libraryItemRepository } from '../repository/library_item'
import { logger as baseLogger } from '../utils/logger'

const logger = baseLogger.child({ context: 'content-worker-helpers' })

/**
 * Applies labels to a library item
 */
export async function applyLabelsToLibraryItem(
  libraryItemId: string,
  labelNames: string[],
  userId: string
): Promise<void> {
  try {
    // Find or create labels
    const labels = await Promise.all(
      labelNames.map(async (name) => {
        let label = await labelRepository.findByName(name, userId)

        if (!label) {
          label = await labelRepository.save({
            name,
            userId,
            color: generateRandomColor(),
            description: null,
            createdAt: new Date(),
          })
        }

        return label
      })
    )

    // Apply labels to library item
    const libraryItem = await libraryItemRepository.findOneBy({
      id: libraryItemId,
      userId,
    })

    if (libraryItem) {
      libraryItem.labels = labels
      await libraryItemRepository.save(libraryItem)

      logger.info(
        `Applied ${labels.length} labels to library item ${libraryItemId}`
      )
    }
  } catch (error) {
    logger.error(`Failed to apply labels to library item ${libraryItemId}`, {
      error,
      labelNames,
    })
    // Don't throw - this is not critical for content processing
  }
}

/**
 * Generates a thumbnail for content
 */
export async function generateThumbnail(
  libraryItemId: string,
  userId: string
): Promise<void> {
  try {
    await findThumbnail({
      libraryItemId,
      userId,
    })

    logger.info(`Generated thumbnail for library item ${libraryItemId}`)
  } catch (error) {
    logger.error(
      `Failed to generate thumbnail for library item ${libraryItemId}`,
      { error }
    )
    // Don't throw - this is not critical for content processing
  }
}

/**
 * Applies user rules to a library item
 */
export async function applyRulesToLibraryItem(
  libraryItemId: string,
  userId: string
): Promise<void> {
  try {
    await applyRules({
      libraryItemId,
      userId,
    })

    logger.info(`Applied rules to library item ${libraryItemId}`)
  } catch (error) {
    logger.error(`Failed to apply rules to library item ${libraryItemId}`, {
      error,
    })
    // Don't throw - this is not critical for content processing
  }
}

/**
 * Generates a random color for labels
 */
function generateRandomColor(): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
    '#F8C471',
    '#82E0AA',
    '#F1948A',
    '#85C1E9',
    '#D7DBDD',
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}
