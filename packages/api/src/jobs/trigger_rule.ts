import { ReadingProgressDataSource } from '../datasources/reading_progress_data_source'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import { Rule, RuleAction, RuleActionType, RuleEventType } from '../entity/rule'
import { addLabelsToLibraryItem } from '../services/labels'
import {
  SearchArgs,
  searchLibraryItems,
  softDeleteLibraryItem,
  updateLibraryItem,
} from '../services/library_item'
import { findEnabledRules } from '../services/rules'
import { sendPushNotifications } from '../services/user'
import { logger } from '../utils/logger'

export interface TriggerRuleJobData {
  libraryItemId: string
  userId: string
  ruleEventType: RuleEventType
}

interface RuleActionObj {
  userId: string
  action: RuleAction
  libraryItem: LibraryItem
}
type RuleActionFunc = (obj: RuleActionObj) => Promise<unknown>

export const TRIGGER_RULE_JOB_NAME = 'trigger-rule'
const readingProgressDataSource = new ReadingProgressDataSource()

const addLabels = async (obj: RuleActionObj) => {
  const labelIds = obj.action.params

  return addLabelsToLibraryItem(
    labelIds,
    obj.libraryItem.id,
    obj.userId,
    'system'
  )
}

const deleteLibraryItem = async (obj: RuleActionObj) => {
  return softDeleteLibraryItem(obj.libraryItem.id, obj.userId)
}

const archivePage = async (obj: RuleActionObj) => {
  return updateLibraryItem(
    obj.libraryItem.id,
    { archivedAt: new Date(), state: LibraryItemState.Archived },
    obj.userId,
    undefined,
    true
  )
}

const markPageAsRead = async (obj: RuleActionObj) => {
  return readingProgressDataSource.updateReadingProgress(
    obj.userId,
    obj.libraryItem.id,
    {
      readingProgressPercent: 100,
      readingProgressTopPercent: 100,
      readingProgressAnchorIndex: undefined,
    }
  )
}

const sendNotification = async (obj: RuleActionObj) => {
  const item = obj.libraryItem
  const message = {
    title: item.author || item.siteName || 'Omnivore',
    body: item.title,
    image: item.thumbnail,
  }
  const data = {
    folder: item.folder,
    libraryItemId: item.id,
  }

  return sendPushNotifications(obj.userId, message, 'rule', data)
}

const getRuleAction = (actionType: RuleActionType): RuleActionFunc => {
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
  }
}

const triggerActions = async (
  userId: string,
  rules: Rule[],
  data: TriggerRuleJobData
) => {
  const actionPromises: Promise<unknown>[] = []

  for (const rule of rules) {
    const itemId = data.libraryItemId
    const searchArgs: SearchArgs = {
      includeContent: false,
      includeDeleted: false,
      includePending: false,
      size: 1,
      query: `(${rule.filter}) AND includes:${itemId}`,
    }

    const libraryItems = await searchLibraryItems(searchArgs, userId)
    if (libraryItems.count === 0) {
      logger.info(`No pages found for rule ${rule.id}`)
      continue
    }

    const libraryItem = libraryItems.libraryItems[0]

    for (const action of rule.actions) {
      const actionFunc = getRuleAction(action.type)
      const actionObj: RuleActionObj = {
        userId,
        action,
        libraryItem,
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

export const triggerRule = async (data: TriggerRuleJobData) => {
  const { userId, ruleEventType } = data

  // get rules by calling api
  const rules = await findEnabledRules(userId, ruleEventType)
  if (rules.length === 0) {
    console.log('No rules found')
    return false
  }

  await triggerActions(userId, rules, data)

  return true
}
