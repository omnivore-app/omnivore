import { DeepPartial, EntityManager } from 'typeorm'
import { Webhook } from '../entity/webhook'
import { authTrx } from '../repository'

export const createWebhooks = async (
  webhooks: DeepPartial<Webhook>[],
  userId?: string,
  entityManager?: EntityManager,
) => {
  return authTrx(
    (tx) => tx.getRepository(Webhook).save(webhooks),
    entityManager,
    userId,
  )
}

export const createWebhook = async (
  webhook: DeepPartial<Webhook>,
  userId?: string,
  entityManager?: EntityManager,
) => {
  return authTrx(
    (tx) => tx.getRepository(Webhook).save(webhook),
    entityManager,
    userId,
  )
}

export const findWebhooks = async (userId: string) => {
  return authTrx(
    (tx) => tx.getRepository(Webhook).findBy({ user: { id: userId } }),
    undefined,
    userId,
  )
}

export const findWebhookById = async (id: string, userId: string) => {
  return authTrx(
    (tx) => tx.getRepository(Webhook).findOneBy({ id, user: { id: userId } }),
    undefined,
    userId,
  )
}

export const deleteWebhook = async (id: string, userId: string) => {
  return authTrx(
    async (tx) => {
      const repo = tx.getRepository(Webhook)
      const webhook = await repo.findOneByOrFail({ id, user: { id: userId } })
      await repo.delete(id)
      return webhook
    },
    undefined,
    userId,
  )
}
