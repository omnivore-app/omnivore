import { IntegrationType } from '../../entity/integration'
import {
  findIntegration,
  getIntegrationClient,
  updateIntegration,
} from '../../services/integrations'
import { findRecentLibraryItems } from '../../services/library_item'
import { findActiveUser } from '../../services/user'
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

  const client = getIntegrationClient(
    integration.name,
    integration.token,
    integration
  )

  const maxItems = 100
  const limit = 10
  let exported = 0
  // get max 100 most recent items from the database
  for (let offset = 0; offset < maxItems; offset += limit) {
    const libraryItems = await findRecentLibraryItems(userId, limit, offset)
    if (libraryItems.length === 0) {
      logger.info('no library items found', {
        userId,
      })
      break
    }

    logger.info('enqueuing export item...', {
      userId,
      offset,
      integrationId,
    })

    const synced = await client.export(libraryItems)
    if (!synced) {
      logger.error('failed to export item', jobData)
      continue
    }

    const syncedAt = new Date()
    logger.info('updating integration...', {
      ...jobData,
      syncedAt,
    })

    // update integration syncedAt if successful
    const updated = await updateIntegration(
      integration.id,
      {
        syncedAt,
      },
      userId
    )
    logger.info('integration updated', {
      ...jobData,
      updated,
    })

    exported += libraryItems.length

    logger.info('exported items', {
      ...jobData,
      exported,
    })
  }

  logger.info('exported all items', {
    ...jobData,
    exported,
  })

  // clear task name in integration
  await updateIntegration(integration.id, { taskName: null }, userId)
}
