import { User } from '../entity/user'
import { Rule, RuleAction } from '../entity/rule'
import { getRepository } from '../entity/utils'
import { ILike } from 'typeorm'

export const createRule = async (
  user: User,
  rule: {
    name: string
    description?: string
    actions: RuleAction[]
    filter: string
  }
): Promise<Rule> => {
  const existingRule = await getRepository(Rule).findOneBy({
    user: { id: user.id },
    name: ILike(rule.name),
  })

  if (existingRule) {
    return existingRule
  }

  return getRepository(Rule).save({
    ...rule,
    user: { id: user.id },
  })
}
