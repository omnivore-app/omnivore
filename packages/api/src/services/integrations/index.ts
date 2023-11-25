import { DeepPartial, FindOptionsWhere } from 'typeorm'
import { Integration } from '../../entity/integration'
import { authTrx } from '../../repository'
import { IntegrationClient } from './integration'
import { PocketClient } from './pocket'
import { ReadwiseClient } from './readwise'

const integrations: IntegrationClient[] = [
  new ReadwiseClient(),
  new PocketClient(),
]

export const getIntegrationClient = (name: string): IntegrationClient => {
  const service = integrations.find((s) => s.name === name)
  if (!service) {
    throw new Error(`Integration client not found: ${name}`)
  }
  return service
}

export const deleteIntegrations = async (
  userId: string,
  criteria: string[] | FindOptionsWhere<Integration>,
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).delete(criteria),
    undefined,
    userId,
  )
}

export const removeIntegration = async (
  integration: Integration,
  userId: string,
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).remove(integration),
    undefined,
    userId,
  )
}

export const findIntegration = async (
  where: FindOptionsWhere<Integration> | FindOptionsWhere<Integration>[],
  userId: string,
) => {
  return authTrx(
    async (t) =>
      t.getRepository(Integration).findOneBy({
        ...where,
        user: { id: userId },
      }),
    undefined,
    userId,
  )
}

export const findIntegrations = async (
  userId: string,
  where?: FindOptionsWhere<Integration> | FindOptionsWhere<Integration>[],
) => {
  return authTrx(
    async (t) =>
      t.getRepository(Integration).findBy({
        ...where,
        user: { id: userId },
      }),
    undefined,
    userId,
  )
}

export const saveIntegration = async (
  integration: DeepPartial<Integration>,
  userId: string,
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).save(integration),
    undefined,
    userId,
  )
}

export const updateIntegration = async (
  id: string,
  integration: DeepPartial<Integration>,
  userId: string,
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).update(id, integration),
    undefined,
    userId,
  )
}
