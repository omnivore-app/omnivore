import { DeepPartial, FindOptionsWhere } from 'typeorm'
import { Integration } from '../../entity/integration'
import { authTrx } from '../../repository'
import { IntegrationService } from './integration'
import { PocketIntegration } from './pocket'
import { ReadwiseIntegration } from './readwise'

const integrations: IntegrationService[] = [
  new ReadwiseIntegration(),
  new PocketIntegration(),
]

export const getIntegrationService = (name: string): IntegrationService => {
  const service = integrations.find((s) => s.name === name)
  if (!service) {
    throw new Error(`Integration service not found: ${name}`)
  }
  return service
}

export const deleteIntegrations = async (
  userId: string,
  criteria: string[] | FindOptionsWhere<Integration>
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).delete(criteria),
    undefined,
    userId
  )
}

export const removeIntegration = async (
  integration: Integration,
  userId: string
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).remove(integration),
    undefined,
    userId
  )
}

export const findIntegration = async (
  where: FindOptionsWhere<Integration> | FindOptionsWhere<Integration>[],
  userId: string
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).findOneBy(where),
    undefined,
    userId
  )
}

export const findIntegrations = async (
  userId: string,
  where?: FindOptionsWhere<Integration> | FindOptionsWhere<Integration>[]
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).find({ where }),
    undefined,
    userId
  )
}

export const createIntegration = async (
  integration: DeepPartial<Integration>,
  userId: string
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).save(integration),
    undefined,
    userId
  )
}

export const updateIntegration = async (
  id: string,
  integration: DeepPartial<Integration>,
  userId: string
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).update(id, integration),
    undefined,
    userId
  )
}
