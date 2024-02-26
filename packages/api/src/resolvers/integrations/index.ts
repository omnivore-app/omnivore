import { DeepPartial } from 'typeorm'
import {
  ImportItemState,
  Integration,
  IntegrationType,
} from '../../entity/integration'
import { env } from '../../env'
import {
  DeleteIntegrationError,
  DeleteIntegrationErrorCode,
  DeleteIntegrationSuccess,
  ImportFromIntegrationError,
  ImportFromIntegrationErrorCode,
  ImportFromIntegrationSuccess,
  IntegrationsError,
  IntegrationsErrorCode,
  IntegrationsSuccess,
  MutationDeleteIntegrationArgs,
  MutationImportFromIntegrationArgs,
  MutationSetIntegrationArgs,
  SetIntegrationError,
  SetIntegrationErrorCode,
  SetIntegrationSuccess,
} from '../../generated/graphql'
import { createIntegrationToken } from '../../routers/auth/jwt_helpers'
import {
  findIntegration,
  findIntegrations,
  getIntegrationClient,
  removeIntegration,
  saveIntegration,
  updateIntegration,
} from '../../services/integrations'
import { analytics } from '../../utils/analytics'
import {
  deleteTask,
  enqueueExportAllItems,
  enqueueImportFromIntegration,
} from '../../utils/createTask'
import { authorized } from '../../utils/gql-utils'

export const setIntegrationResolver = authorized<
  SetIntegrationSuccess,
  SetIntegrationError,
  MutationSetIntegrationArgs
>(async (_, { input }, { uid, log }) => {
  try {
    const integrationToSave: DeepPartial<Integration> = {
      ...input,
      user: { id: uid },
      id: input.id || undefined,
      type: input.type || IntegrationType.Export,
      syncedAt: input.syncedAt ? new Date(input.syncedAt) : undefined,
      importItemState:
        input.type === IntegrationType.Import
          ? input.importItemState || ImportItemState.Unarchived // default to unarchived
          : undefined,
    }
    if (input.id) {
      // Update
      const existingIntegration = await findIntegration({ id: input.id }, uid)
      if (!existingIntegration) {
        return {
          errorCodes: [SetIntegrationErrorCode.NotFound],
        }
      }

      integrationToSave.id = existingIntegration.id
      integrationToSave.taskName = existingIntegration.taskName
    } else {
      // Create
      const integrationService = getIntegrationClient(input.name)
      // authorize and get access token
      const token = await integrationService.accessToken(input.token)
      if (!token) {
        return {
          errorCodes: [SetIntegrationErrorCode.InvalidToken],
        }
      }
      integrationToSave.token = token
    }

    // save integration
    const integration = await saveIntegration(integrationToSave, uid)

    if (integrationToSave.type === IntegrationType.Export && !input.id) {
      const authToken = await createIntegrationToken({
        uid,
        token: integration.token,
      })
      if (!authToken) {
        log.error('failed to create auth token', {
          integrationId: integration.id,
        })
        return {
          errorCodes: [SetIntegrationErrorCode.BadRequest],
        }
      }

      // create a task to sync all the pages if new integration or enable integration (export type)
      await enqueueExportAllItems(integration.id, uid)
    } else if (integrationToSave.taskName) {
      // delete the task if disable integration and task exists
      const result = await deleteTask(integrationToSave.taskName)
      if (result) {
        log.info('task deleted', integrationToSave.taskName)
      }

      // update task name in integration
      await updateIntegration(
        integration.id,
        {
          taskName: null,
        },
        uid
      )
      integration.taskName = null
    }

    analytics.capture({
      distinctId: uid,
      event: 'integration_set',
      properties: {
        id: integrationToSave.id,
        env: env.server.apiEnv,
      },
    })

    return {
      integration,
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [SetIntegrationErrorCode.BadRequest],
    }
  }
})

export const integrationsResolver = authorized<
  IntegrationsSuccess,
  IntegrationsError
>(async (_, __, { uid, log }) => {
  try {
    const integrations = await findIntegrations(uid)

    return {
      integrations,
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [IntegrationsErrorCode.BadRequest],
    }
  }
})

export const deleteIntegrationResolver = authorized<
  DeleteIntegrationSuccess,
  DeleteIntegrationError,
  MutationDeleteIntegrationArgs
>(async (_, { id }, { claims: { uid }, log }) => {
  log.info('deleteIntegrationResolver')

  try {
    const integration = await findIntegration({ id }, uid)

    if (!integration) {
      return {
        errorCodes: [DeleteIntegrationErrorCode.NotFound],
      }
    }

    if (integration.taskName) {
      // delete the task if task exists
      await deleteTask(integration.taskName)
      log.info('task deleted', integration.taskName)
    }

    const deletedIntegration = await removeIntegration(integration, uid)
    deletedIntegration.id = id

    analytics.capture({
      distinctId: uid,
      event: 'integration_delete',
      properties: {
        integrationId: deletedIntegration.id,
        env: env.server.apiEnv,
      },
    })

    return {
      integration,
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [DeleteIntegrationErrorCode.BadRequest],
    }
  }
})

export const importFromIntegrationResolver = authorized<
  ImportFromIntegrationSuccess,
  ImportFromIntegrationError,
  MutationImportFromIntegrationArgs
>(async (_, { integrationId }, { claims: { uid }, log }) => {
  try {
    const integration = await findIntegration({ id: integrationId }, uid)

    if (!integration) {
      return {
        errorCodes: [ImportFromIntegrationErrorCode.Unauthorized],
      }
    }

    const authToken = await createIntegrationToken({
      uid: integration.user.id,
      token: integration.token,
    })
    if (!authToken) {
      return {
        errorCodes: [ImportFromIntegrationErrorCode.BadRequest],
      }
    }

    // create a task to import all the pages
    const taskName = await enqueueImportFromIntegration(
      integration.id,
      integration.name,
      integration.syncedAt?.getTime() || 0,
      authToken,
      integration.importItemState || ImportItemState.Unarchived
    )
    // update task name in integration
    await updateIntegration(integration.id, { taskName }, uid)

    analytics.capture({
      distinctId: uid,
      event: 'integration_import',
      properties: {
        integrationId,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    log.error(error)

    return {
      errorCodes: [ImportFromIntegrationErrorCode.BadRequest],
    }
  }
})
