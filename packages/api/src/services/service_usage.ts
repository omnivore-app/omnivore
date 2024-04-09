import { Between } from 'typeorm'
import { ServiceUsage } from '../entity/service_usage'
import { authTrx, getRepository } from '../repository'
import { DateTime } from 'luxon'

const repo = getRepository(ServiceUsage)

export const countDailyServiceUsage = async (
  userId: string,
  action: string
) => {
  return authTrx((tx) =>
    tx.withRepository(repo).countBy({
      user: { id: userId },
      action,
      createdAt: Between(
        DateTime.now().startOf('day').toJSDate(),
        DateTime.now().endOf('day').toJSDate()
      ),
    })
  )
}

export const createServiceUsage = async (userId: string, action: string) => {
  return authTrx((tx) =>
    tx.withRepository(repo).save({
      user: { id: userId },
      action,
    })
  )
}
