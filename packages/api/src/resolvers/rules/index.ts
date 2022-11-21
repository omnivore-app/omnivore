import { authorized } from '../../utils/helpers'
import {
  MutationSetRuleArgs,
  QueryRulesArgs,
  RulesError,
  RulesErrorCode,
  RulesSuccess,
  SetRuleError,
  SetRuleErrorCode,
  SetRuleSuccess,
} from '../../generated/graphql'
import { getRepository } from '../../entity/utils'
import { User } from '../../entity/user'
import { Rule } from '../../entity/rule'

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

export const rulesResolver = authorized<
  RulesSuccess,
  RulesError,
  QueryRulesArgs
>(async (_, { enabled }, { claims, log }) => {
  log.info('Getting rules', {
    enabled,
    labels: {
      source: 'resolver',
      resolver: 'rulesResolver',
      uid: claims.uid,
    },
  })

  try {
    const user = await getRepository(User).findOneBy({ id: claims.uid })
    if (!user) {
      return {
        errorCodes: [RulesErrorCode.Unauthorized],
      }
    }

    const rules = await getRepository(Rule).findBy({
      user: { id: claims.uid },
      enabled: enabled === null ? undefined : enabled,
    })

    return {
      rules,
    }
  } catch (error) {
    log.error('Error getting rules', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'rulesResolver',
        uid: claims.uid,
      },
    })

    return {
      errorCodes: [RulesErrorCode.BadRequest],
    }
  }
})
