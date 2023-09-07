import { DeepPartial } from 'typeorm'
import { Integration, IntegrationType } from '../../entity/integration'
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
import {
  createIntegration,
  findIntegration,
  findIntegrations,
  getIntegrationService,
  removeIntegration,
  updateIntegration,
} from '../../services/integrations'
import { analytics } from '../../utils/analytics'
import {
  deleteTask,
  enqueueImportFromIntegration,
  enqueueSyncWithIntegration,
} from '../../utils/createTask'
import { authorized } from '../../utils/helpers'

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
    }
    if (input.id) {
      // Update
      const existingIntegration = await findIntegration({ id: input.id }, uid)
      if (!existingIntegration) {
        return {
          errorCodes: [SetIntegrationErrorCode.NotFound],
        }
      }
      if (existingIntegration.user.id !== uid) {
        return {
          errorCodes: [SetIntegrationErrorCode.Unauthorized],
        }
      }

      integrationToSave.id = existingIntegration.id
      integrationToSave.taskName = existingIntegration.taskName
    } else {
      // Create
      const integrationService = getIntegrationService(input.name)
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
    const integration = await createIntegration(integrationToSave, uid)

    if (
      integrationToSave.type === IntegrationType.Export &&
      (!integrationToSave.id || integrationToSave.enabled)
    ) {
      // create a task to sync all the pages if new integration or enable integration (export type)
      const taskName = await enqueueSyncWithIntegration(uid, input.name)
      log.info('enqueued task', taskName)

      // update task name in integration
      await updateIntegration(integration.id, { taskName }, uid)
      integration.taskName = taskName
    } else if (integrationToSave.taskName) {
      // delete the task if disable integration and task exists
      await deleteTask(integrationToSave.taskName)
      log.info('task deleted', integrationToSave.taskName)

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

    analytics.track({
      userId: uid,
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

    analytics.track({
      userId: uid,
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
>(async (_, { integrationId }, { claims: { uid }, log, signToken }) => {
  log.info('importFromIntegrationResolver')

  try {
    const integration = await findIntegration({ id: integrationId }, uid)

    if (!integration) {
      return {
        errorCodes: [ImportFromIntegrationErrorCode.Unauthorized],
      }
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
    const authToken = (await signToken(
      { uid, exp },
      env.server.jwtSecret
    )) as string
    // create a task to import all the pages
    const taskName = await enqueueImportFromIntegration(
      integration.id,
      authToken
    )
    // update task name in integration
    await updateIntegration(integration.id, { taskName }, uid)

    analytics.track({
      userId: uid,
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
