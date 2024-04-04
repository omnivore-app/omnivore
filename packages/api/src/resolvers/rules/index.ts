import { Rule } from '../../entity/rule'
import {
  DeleteRuleError,
  DeleteRuleErrorCode,
  DeleteRuleSuccess,
  MutationDeleteRuleArgs,
  MutationSetRuleArgs,
  QueryRulesArgs,
  RulesError,
  RulesSuccess,
  SetRuleError,
  SetRuleErrorCode,
  SetRuleSuccess,
} from '../../generated/graphql'
import { deleteRule } from '../../services/rules'
import { authorized } from '../../utils/gql-utils'
import { parseSearchQuery } from '../../utils/search'

export const setRuleResolver = authorized<
  SetRuleSuccess,
  SetRuleError,
  MutationSetRuleArgs
>(async (_, { input }, { authTrx, uid }) => {
  try {
    // validate filter
    parseSearchQuery(input.filter)
  } catch (error) {
    return {
      errorCodes: [SetRuleErrorCode.BadRequest],
    }
  }

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
})

export const rulesResolver = authorized<
  RulesSuccess,
  RulesError,
  QueryRulesArgs
>(async (_, { enabled }, { authTrx, uid }) => {
  const rules = await authTrx((t) =>
    t.getRepository(Rule).findBy({
      user: { id: uid },
      enabled: enabled === null ? undefined : enabled,
    })
  )

  return {
    rules,
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
