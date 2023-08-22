import { getRepository } from '../../entity'
import { Rule } from '../../entity/rule'
import { User } from '../../entity/user'
import {
  DeleteRuleError,
  DeleteRuleErrorCode,
  DeleteRuleSuccess,
  MutationDeleteRuleArgs,
  MutationSetRuleArgs,
  QueryRulesArgs,
  RulesError,
  RulesErrorCode,
  RulesSuccess,
  SetRuleError,
  SetRuleErrorCode,
  SetRuleSuccess,
} from '../../generated/graphql'
import { authorized } from '../../utils/helpers'

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

export const deleteRuleResolver = authorized<
  DeleteRuleSuccess,
  DeleteRuleError,
  MutationDeleteRuleArgs
>(async (_, { id }, { claims, log }) => {
  log.info('Deleting rule', {
    id,
    labels: {
      source: 'resolver',
      resolver: 'deleteRuleResolver',
      uid: claims.uid,
    },
  })

  try {
    const rule = await getRepository(Rule).findOneBy({
      id,
      user: { id: claims.uid },
    })
    if (!rule) {
      return {
        errorCodes: [DeleteRuleErrorCode.NotFound],
      }
    }

    await getRepository(Rule).delete({
      id: rule.id,
    })

    return {
      rule,
    }
  } catch (error) {
    log.error('Error deleting rule', {
      error,
      labels: {
        source: 'resolver',
        resolver: 'deleteRuleResolver',
        uid: claims.uid,
      },
    })

    return {
      errorCodes: [DeleteRuleErrorCode.BadRequest],
    }
  }
})
