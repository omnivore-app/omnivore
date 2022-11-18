import { RuleAction, RuleActionType } from '../generated/graphql'
import { CreateSubscriptionOptions } from '@google-cloud/pubsub'

enum RuleTrigger {
  ON_PAGE_UPDATE,
  CRON,
}

export const getRuleTrigger = (action: RuleAction): RuleTrigger => {
  switch (action.type) {
    case RuleActionType.AddLabel:
    case RuleActionType.Archive:
    case RuleActionType.MarkAsRead:
    case RuleActionType.SendNotification:
      return RuleTrigger.ON_PAGE_UPDATE
    // TODO: Add more actions, e.g. RuleActionType.SendEmail
  }

  return RuleTrigger.ON_PAGE_UPDATE
}

export const getPubSubTopicName = (action: RuleAction): string => {
  const trigger = getRuleTrigger(action)

  switch (trigger) {
    case RuleTrigger.ON_PAGE_UPDATE:
      return 'entityUpdated'
    // TODO: Add more triggers, e.g. RuleTrigger.CRON
  }

  return 'entityUpdated'
}

export const getPubSubSubscriptionName = (
  topicName: string,
  userId: string,
  ruleName: string
): string => {
  return `${topicName}-${userId}-rule-${ruleName}`
}

export const getPubSubSubscriptionOptions = (
  userId: string,
  ruleName: string,
  query: string,
  action: RuleAction
): CreateSubscriptionOptions => {
  const topic = getPubSubTopicName(action)
  const name = getPubSubSubscriptionName(topic, userId, ruleName)
  const options: CreateSubscriptionOptions = {
    name,
    topic,
    messageRetentionDuration: 60 * 10, // 10 minutes
    expirationPolicy: {
      ttl: null, // never expire
    },
    ackDeadlineSeconds: 10,
    retryPolicy: {
      minimumBackoff: {
        seconds: 10,
      },
      maximumBackoff: {
        seconds: 600,
      },
    },
    filter: query,
  }

  switch (action.type) {
    case RuleActionType.SendNotification:
      options.pushEndpoint = `${process.env
        .PUSH_NOTIFICATION_ENDPOINT!}?message=${action.params[0]}`
      break
    // TODO: Add more actions, e.g. RuleActionType.SendEmail
  }

  return options
}
