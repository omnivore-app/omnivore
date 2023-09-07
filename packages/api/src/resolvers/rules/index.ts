import { Rule } from '../../entity/rule'
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
import { deleteRule } from '../../services/rules'
import { authorized } from '../../utils/helpers'

export const setRuleResolver = authorized<
  SetRuleSuccess,
  SetRuleError,
  MutationSetRuleArgs
>(async (_, { input }, { authTrx, uid, log }) => {
  try {
    const rule = await authTrx((t) =>
      t.getRepository(Rule).save({
        ...input,
        id: input.id || undefined,
        user: { id: uid },
      })
    )

    return {
      rule,
    }
  } catch (error) {
    log.error('Error setting rules', error)

    return {
      errorCodes: [SetRuleErrorCode.BadRequest],
    }
  }
})

export const rulesResolver = authorized<
  RulesSuccess,
  RulesError,
  QueryRulesArgs
>(async (_, { enabled }, { authTrx, log }) => {
  try {
    const rules = await authTrx((t) =>
      t.getRepository(Rule).findBy({
        enabled: enabled === null ? undefined : enabled,
      })
    )

    return {
      rules,
    }
  } catch (error) {
    log.error('Error getting rules', error)

    return {
      errorCodes: [RulesErrorCode.BadRequest],
    }
  }
})

export const deleteRuleResolver = authorized<
  DeleteRuleSuccess,
  DeleteRuleError,
  MutationDeleteRuleArgs
>(async (_, { id }, { uid, log }) => {
  try {
    const rule = await deleteRule(id, uid)

    return {
      rule,
    }
  } catch (error) {
    log.error('Error deleting rule', error)

    return {
      errorCodes: [DeleteRuleErrorCode.NotFound],
    }
  }
})
