import { authorized } from '../../utils/helpers'
import {
  MutationSetRuleArgs,
  SetRuleError,
  SetRuleErrorCode,
  SetRuleSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { Rule } from '../../entity/rule'
import {
  getPubSubSubscriptionName,
  getPubSubSubscriptionOptions,
  getPubSubTopicName,
} from '../../services/rules'
import {
  createPubSubSubscription,
  deletePubSubSubscription,
} from '../../datalayer/pubsub'

export const setRuleResolver = authorized<
  SetRuleSuccess,
  SetRuleError,
  MutationSetRuleArgs
>(async (_, { input }, { claims, log }) => {
  log.info('Setting rules', {
    input,
    labels: {
      source: 'resolver',
      resolver: 'setRulesResolver',
      uid: claims.uid,
    },
  })

  try {
    const user = await getRepository(User).findOneBy({ id: claims.uid })
    if (!user) {
      return {
        errorCodes: [SetRuleErrorCode.Unauthorized],
      }
    }

    // create or delete pubsub subscription based on action and enabled state
    for (const action of input.actions) {
      const topicName = getPubSubTopicName(action)
      const subscriptionName = getPubSubSubscriptionName(
        topicName,
        user.id,
        input.name
      )

      if (input.enabled) {
        const options = getPubSubSubscriptionOptions(
          user.id,
          input.name,
          input.filter,
          action
        )
        await createPubSubSubscription(topicName, subscriptionName, options)
      } else {
        await deletePubSubSubscription(topicName, subscriptionName)
      }
    }

    const rule = await getRepository(Rule).save({
      ...input,
      id: input.id || undefined,
      user: { id: claims.uid },
    })

    return {
      rule,
    }
  } catch (error) {
    log.error('Error setting rules', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'setRulesResolver',
        uid: claims.uid,
      },
    })

    return {
      errorCodes: [SetRuleErrorCode.BadRequest],
    }
  }
})
