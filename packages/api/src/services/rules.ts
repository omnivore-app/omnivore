import { ILike } from 'typeorm'
import { Rule, RuleAction } from '../entity/rule'
import { getRepository } from '../repository'

export const createRule = async (
  userId: string,
  rule: {
    name: string
    description?: string
    actions: RuleAction[]
    filter: string
  }
): Promise<Rule> => {
  const existingRule = await getRepository(Rule).findOneBy({
    user: { id: userId },
    name: ILike(rule.name),
  })

  if (existingRule) {
    return existingRule
  }

  return getRepository(Rule).save({
    ...rule,
    user: { id: userId },
  })
}
