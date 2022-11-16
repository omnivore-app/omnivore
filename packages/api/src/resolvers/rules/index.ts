import { authorized } from '../../utils/helpers'
import {
  MutationSetRuleArgs,
  SetRuleError,
  SetRuleSuccess,
} from '../../generated/graphql'

export const setRulesResolver = authorized<
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

  return {
    rules,
  }
})
