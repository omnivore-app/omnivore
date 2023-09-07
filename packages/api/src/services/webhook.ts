import { DeepPartial, EntityManager } from 'typeorm'
import { Webhook } from '../entity/webhook'
import { authTrx } from '../repository'

export const createWebhooks = async (
  webhooks: DeepPartial<Webhook>[],
  userId?: string,
  entityManager?: EntityManager
) => {
  return authTrx(
    (tx) => tx.getRepository(Webhook).save(webhooks),
    entityManager,
    userId
  )
}

export const createWebhook = async (
  webhook: DeepPartial<Webhook>,
  userId?: string,
  entityManager?: EntityManager
) => {
  return authTrx(
    (tx) => tx.getRepository(Webhook).save(webhook),
    entityManager,
    userId
  )
}
