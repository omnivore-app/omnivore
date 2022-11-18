import { RuleAction, RuleActionType } from '../generated/graphql'
import { CreateSubscriptionOptions } from '@google-cloud/pubsub'
import { env } from '../env'

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
  filter: string,
  action: RuleAction
): CreateSubscriptionOptions => {
  const options: CreateSubscriptionOptions = {
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
    filter,
  }

  switch (action.type) {
    case RuleActionType.SendNotification: {
      const params = action.params
      if (params.length === 0) {
        throw new Error('Missing notification messages')
      }

      options.pushConfig = {
        pushEndpoint: `${env.queue.notificationEndpoint}/${userId}`,
        attributes: {
          messages: JSON.stringify(params),
        },
      }
      break
    }
    // TODO: Add more actions, e.g. RuleActionType.SendEmail
  }

  return options
}
