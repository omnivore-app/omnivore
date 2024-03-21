import { LiqeQuery } from '@omnivore/liqe'
import axios, { Method } from 'axios'
import { ReadingProgressDataSource } from '../datasources/reading_progress_data_source'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { Rule, RuleAction, RuleActionType, RuleEventType } from '../entity/rule'
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
  libraryItemId: string
  userId: string
  ruleEventType: RuleEventType
  data: ItemEvent
}

interface RuleActionObj {
  libraryItemId: string
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

  return addLabelsToLibraryItem(
    labelIds,
    obj.libraryItemId,
    obj.userId,
    'system'
  )
}

const deleteLibraryItem = async (obj: RuleActionObj) => {
  return softDeleteLibraryItem(obj.libraryItemId, obj.userId)
}

const archivePage = async (obj: RuleActionObj) => {
  return updateLibraryItem(
    obj.libraryItemId,
    { archivedAt: new Date(), state: LibraryItemState.Archived },
    obj.userId,
    undefined,
    true
  )
}

const markPageAsRead = async (obj: RuleActionObj) => {
  return readingProgressDataSource.updateReadingProgress(
    obj.userId,
    obj.libraryItemId,
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
    libraryItemId: obj.libraryItemId,
  }

  return sendPushNotifications(obj.userId, message, 'rule', data)
}

const sendToWebhook = async (obj: RuleActionObj) => {
  const [url, method, contentType] = obj.action.params
  const [type, action] = obj.ruleEventType.split('_')

  const body = {
    action,
    userId: obj.userId,
    [type]: obj.data,
  }

  logger.info('triggering webhook', { url, method })

  return axios.request({
    url,
    method: method as Method,
    headers: {
      'Content-Type': contentType,
    },
    data: body,
    timeout: 5000, // 5s
  })
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
    default:
      logger.error('Unknown rule action type', actionType)
      return undefined
  }
}

const triggerActions = async (
  libraryItemId: string,
  userId: string,
  rules: Rule[],
  data: ItemEvent,
  ruleEventType: RuleEventType
) => {
  const actionPromises: Promise<unknown>[] = []

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
        const searchResult = await searchLibraryItems(
          {
            query: `includes:${libraryItemId} AND (${rule.filter})`,
            size: 1,
          },
          userId
        )
        results = searchResult.libraryItems
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
        libraryItemId,
        userId,
        action,
        data: results[0],
        ruleEventType,
      }

      actionPromises.push(actionFunc(actionObj))
    }
  }

  try {
    await Promise.all(actionPromises)
  } catch (error) {
    logger.error('Error triggering rule actions', error)
  }
}

export const triggerRule = async (jobData: TriggerRuleJobData) => {
  const { userId, ruleEventType, data, libraryItemId } = jobData

  // get rules by calling api
  const rules = await findEnabledRules(userId, ruleEventType)
  if (rules.length === 0) {
    console.log('No rules found')
    return false
  }

  await triggerActions(libraryItemId, userId, rules, data, ruleEventType)

  return true
}
