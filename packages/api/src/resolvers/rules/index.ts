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
