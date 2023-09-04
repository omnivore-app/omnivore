import { ILike } from 'typeorm'
import { Rule, RuleAction } from '../entity/rule'
import { authTrx } from '../repository'

export const createRule = async (
  userId: string,
  rule: {
    name: string
    description?: string
    actions: RuleAction[]
    filter: string
  }
): Promise<Rule> => {
  const existingRule = await authTrx((t) =>
    t.getRepository(Rule).findOneBy({
      name: ILike(rule.name),
    })
  )

  if (existingRule) {
    return existingRule
  }

  return authTrx((t) =>
    t.getRepository(Rule).save({
      ...rule,
      user: { id: userId },
    })
  )
}
