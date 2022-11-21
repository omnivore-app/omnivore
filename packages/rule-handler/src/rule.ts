import { Rules } from './entity/rules'
import {
  getBatchMessages,
  sendBatchPushNotifications,
} from './sendNotification'
import { getRepository } from './db'
import { UserDeviceToken } from './entity/user_device_tokens'
import { PubSubData } from './index'

enum RuleActionType {
  AddLabel = 'ADD_LABEL',
  Archive = 'ARCHIVE',
  MarkAsRead = 'MARK_AS_READ',
  SendNotification = 'SEND_NOTIFICATION',
}

export const triggerActions = async (
  userId: string,
  rules: Rules[],
  data: PubSubData
) => {
  for (const rule of rules) {
    // TODO: filter out rules that don't match the trigger
    if (!data.subscription) {
      console.debug('no subscription')
      continue
    }

    for (const action of rule.actions) {
      switch (action.type) {
        case RuleActionType.AddLabel:
        case RuleActionType.Archive:
        case RuleActionType.MarkAsRead:
          continue
        case RuleActionType.SendNotification:
          if (action.params.length === 0) {
            console.log('No notification messages provided')
            continue
          }
          await sendNotification(userId, action.params)
      }
    }
  }
}

export const sendNotification = async (userId: string, messages: string[]) => {
  const tokens = await getRepository(UserDeviceToken).findBy({
    user: { id: userId },
  })

  const batchMessages = getBatchMessages(
    messages,
    tokens.map((t) => t.token)
  )

  return sendBatchPushNotifications(batchMessages)
}
