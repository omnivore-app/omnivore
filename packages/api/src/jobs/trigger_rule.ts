import { LiqeQuery } from '@omnivore/liqe'
import axios from 'axios'
import { Any } from 'typeorm'
import { ReadingProgressDataSource } from '../datasources/reading_progress_data_source'
import { IntegrationType } from '../entity/integration'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { Rule, RuleAction, RuleActionType, RuleEventType } from '../entity/rule'
import {
  findIntegrations,
  getIntegrationClient,
  updateIntegration,
} from '../services/integrations'
import { addLabelsToLibraryItem } from '../services/labels'
import {
  filterItemEvents,
  ItemEvent,
  RequiresSearchQueryError,
  searchLibraryItems,
  softDeleteLibraryItem,
  updateLibraryItem,
} from '../services/library_item'
import { findEnabledRules, markRuleAsFailed } from '../services/rules'
import { sendPushNotifications } from '../services/user'
import { logger } from '../utils/logger'
import { parseSearchQuery } from '../utils/search'

export interface TriggerRuleJobData {
  userId: string
  ruleEventType: RuleEventType
  data: ItemEvent
}

interface RuleActionObj {
  userId: string
  action: RuleAction
  data: ItemEvent | LibraryItem
  ruleEventType: RuleEventType
}
type RuleActionFunc = (obj: RuleActionObj) => Promise<unknown>

export const TRIGGER_RULE_JOB_NAME = 'trigger-rule'
const readingProgressDataSource = new ReadingProgressDataSource()

const addLabels = async (obj: RuleActionObj) => {
  const labelIds = obj.action.params

  return addLabelsToLibraryItem(labelIds, obj.data.id, obj.userId, 'system')
}

const deleteLibraryItem = async (obj: RuleActionObj) => {
  return softDeleteLibraryItem(obj.data.id, obj.userId)
}

const archivePage = async (obj: RuleActionObj) => {
  return updateLibraryItem(
    obj.data.id,
    { archivedAt: new Date(), state: LibraryItemState.Archived },
    obj.userId,
    undefined,
    true
  )
}

const markPageAsRead = async (obj: RuleActionObj) => {
  return readingProgressDataSource.updateReadingProgress(
    obj.userId,
    obj.data.id,
    {
      readingProgressPercent: 100,
      readingProgressTopPercent: 100,
      readingProgressAnchorIndex: undefined,
    }
  )
}

const sendNotification = async (obj: RuleActionObj) => {
  const item = obj.data
  const message = {
    title: item.author?.toString() || item.siteName?.toString() || 'Omnivore',
    body: item.title?.toString(),
    image: item.thumbnail,
  }
  const data = {
    folder: item.folder?.toString() || 'inbox',
    libraryItemId: obj.data.id,
  }

  return sendPushNotifications(obj.userId, message, 'rule', data)
}

const sendToWebhook = async (obj: RuleActionObj) => {
  const [url] = obj.action.params

  const [type, action] = obj.ruleEventType.toString().toLowerCase().split('_')

  // use old event format for the compatibility with the old webhooks
  let event
  if (type === 'page') {
    event = obj.data
  } else if (type === 'label') {
    event = {
      labels: obj.data.labels,
      pageId: obj.data.id,
    }
  } else {
    if (!obj.data.highlights) {
      return
    }

    event = {
      ...obj.data.highlights[0],
      pageId: obj.data.id,
    }
  }

  const data = {
    action,
    userId: obj.userId,
    [type]: event,
  }

  logger.info(`triggering webhook: ${url}`)

  return axios.post(url, data, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 5000, // 5s
  })
}

const exportItem = async (obj: RuleActionObj) => {
  const userId = obj.userId
  const integrationNames = obj.action.params
  const integrations = await findIntegrations(userId, {
    name: Any(integrationNames.map((param) => param.toUpperCase())),
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
        integrationId: integration.id,
        name: integration.name,
      }
      logger.info('exporting item...', logObject)

      try {
        const client = getIntegrationClient(
          integration.name,
          integration.token,
          integration
        )

        const synced = await client.export([obj.data])
        if (!synced) {
          logger.error('failed to export item', logObject)
          return false
        }

        const syncedAt = new Date()
        logger.info('updating integration...', {
          ...logObject,
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
          ...logObject,
          updated,
        })
      } catch (error) {
        logger.error('failed to export item', {
          ...logObject,
          error,
        })
      }
    })
  )
}

const getRuleAction = (
  actionType: RuleActionType
): RuleActionFunc | undefined => {
  switch (actionType) {
    case RuleActionType.AddLabel:
      return addLabels
    case RuleActionType.Archive:
      return archivePage
    case RuleActionType.Delete:
      return deleteLibraryItem
    case RuleActionType.MarkAsRead:
      return markPageAsRead
    case RuleActionType.SendNotification:
      return sendNotification
    case RuleActionType.Webhook:
      return sendToWebhook
    case RuleActionType.Export:
      return exportItem
    default:
      logger.error('Unknown rule action type', actionType)
      return undefined
  }
}

const triggerActions = async (
  userId: string,
  rules: Rule[],
  data: ItemEvent,
  ruleEventType: RuleEventType
) => {
  for (const rule of rules) {
    let ast: LiqeQuery
    let results: (ItemEvent | LibraryItem)[]

    try {
      ast = parseSearchQuery(rule.filter)
    } catch (error) {
      logger.error('Error parsing filter in rules', error)
      await markRuleAsFailed(rule.id, userId)

      continue
    }

    // filter library item by metadata
    try {
      results = filterItemEvents(ast, [data])
    } catch (error) {
      if (error instanceof RequiresSearchQueryError) {
        logger.info('Failed to filter items by metadata, running search query')
        results = await searchLibraryItems(
          {
            query: `includes:${data.id} AND (${rule.filter})`,
            size: 1,
          },
          userId
        )
      } else {
        logger.error('Error filtering item events', error)
        await markRuleAsFailed(rule.id, userId)

        continue
      }
    }
    if (results.length === 0) {
      logger.info(`No items found for rule ${rule.id}`)
      continue
    }

    for (const action of rule.actions) {
      const actionFunc = getRuleAction(action.type)
      if (!actionFunc) {
        logger.error('No action function found for action', action.type)
        continue
      }

      const actionObj: RuleActionObj = {
        userId,
        action,
        data: results[0],
        ruleEventType,
      }

      try {
        await actionFunc(actionObj)
      } catch (error) {
        logger.error('Error triggering rule action', error)
      }
    }
  }
}

export const triggerRule = async (jobData: TriggerRuleJobData) => {
  const { userId, ruleEventType, data } = jobData

  // get rules by calling api
  const rules = await findEnabledRules(userId, ruleEventType)
  if (rules.length === 0) {
    return false
  }

  await triggerActions(userId, rules, data, ruleEventType)

  return true
}
