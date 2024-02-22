import { IntegrationType } from '../../entity/integration'
import { findIntegration } from '../../services/integrations'
import { searchLibraryItems } from '../../services/library_item'
import { findActiveUser } from '../../services/user'
import { enqueueExportItem } from '../../utils/createTask'
import { logger } from '../../utils/logger'

export interface ExportAllItemsJobData {
  userId: string
  integrationId: string
}

export const EXPORT_ALL_ITEMS_JOB_NAME = 'export-all-items'

export const exportAllItems = async (jobData: ExportAllItemsJobData) => {
  const { userId, integrationId } = jobData
  const user = await findActiveUser(userId)
  if (!user) {
    logger.error('user not found', {
      userId,
    })
    return
  }

  const integration = await findIntegration(
    {
      id: integrationId,
      enabled: true,
      type: IntegrationType.Export,
    },
    userId
  )

  if (!integration) {
    logger.error('integration not found', {
      userId,
      integrationId,
    })
    return
  }

  // get paginated items from the database
  const first = 50
  let after = 0
  for (;;) {
    console.log('searching for items...', {
      userId,
      first,
      after,
    })
    const searchResult = await searchLibraryItems(
      { from: after, size: first },
      userId
    )
    const libraryItems = searchResult.libraryItems
    const size = libraryItems.length
    if (size === 0) {
      break
    }

    await enqueueExportItem({
      userId,
      libraryItemIds: libraryItems.map((item) => item.id),
      integrationId,
    })

    after += size
  }
}
