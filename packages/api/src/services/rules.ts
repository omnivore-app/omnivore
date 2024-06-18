import { ArrayContains, ILike, IsNull, Not } from 'typeorm'
import { Rule, RuleAction, RuleEventType } from '../entity/rule'
import { authTrx, getRepository } from '../repository'

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
      user: { id: userId },
      name: ILike(rule.name),
    })
  )

  if (existingRule) {
    return existingRule
  }

  return authTrx(
    (t) =>
      t.getRepository(Rule).save({
        ...rule,
        user: { id: userId },
      }),
    {
      uid: userId,
    }
  )
}

export const deleteRule = async (id: string, userId: string) => {
  return authTrx(
    async (t) => {
      const repo = t.getRepository(Rule)
      const rule = await repo.findOneByOrFail({ id, user: { id: userId } })
      await repo.delete(id)
      return rule
    },
    {
      uid: userId,
    }
  )
}

export const deleteRules = async (userId: string) => {
  return authTrx(
    (t) => t.getRepository(Rule).delete({ user: { id: userId } }),
    {
      uid: userId,
    }
  )
}

export const findEnabledRules = async (
  userId: string,
  eventType: RuleEventType
) => {
  return getRepository(Rule).findBy({
    user: { id: userId },
    enabled: true,
    eventTypes: ArrayContains([eventType]),
    failedAt: IsNull(), // only rules that have not failed
  })
}

export const markRuleAsFailed = async (id: string, userId: string) => {
  return authTrx(
    (t) =>
      t.getRepository(Rule).update(id, {
        failedAt: new Date(),
      }),
    {
      uid: userId,
    }
  )
}
