import { IntegrationType } from '../entity/integration'
import { LibraryItem } from '../entity/library_item'
import {
  findIntegrations,
  getIntegrationClient,
  updateIntegration,
} from '../services/integrations'
import { logger } from '../utils/logger'

export interface ExportItemJobData {
  userId: string
  libraryItem: LibraryItem
}

export const EXPORT_ITEM_JOB_NAME = 'export-item'

export const exportItem = async (jobData: ExportItemJobData) => {
  const { libraryItem, userId } = jobData
  const integrations = await findIntegrations(userId, {
    enabled: true,
    type: IntegrationType.Export,
  })

  if (integrations.length <= 0) {
    return
  }

  await Promise.all(
    integrations.map(async (integration) => {
      const logObject = {
        userId,
        libraryItemId: libraryItem.id,
        integrationId: integration.id,
      }
      logger.info('exporting item...', logObject)

      try {
        const client = getIntegrationClient(integration.name)

        const synced = await client.export(integration.token, [libraryItem])
        if (!synced) {
          logger.error('failed to export item', logObject)
          return Promise.resolve(false)
        }

        const lastItemUpdatedAt = libraryItem.updatedAt
        logger.info('updating integration...', {
          ...logObject,
          syncedAt: lastItemUpdatedAt,
        })

        // update integration syncedAt if successful
        const updated = await updateIntegration(
          integration.id,
          {
            syncedAt: lastItemUpdatedAt,
          },
          userId
        )
        logger.info('integration updated', {
          ...logObject,
          updated,
        })

        return Promise.resolve(true)
      } catch (err) {
        logger.error('export with integration failed', err)
        return Promise.resolve(false)
      }
    })
  )
}
