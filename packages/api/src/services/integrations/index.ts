import { DeepPartial, FindOptionsWhere } from 'typeorm'
import { Integration } from '../../entity/integration'
import { authTrx } from '../../repository'
import { IntegrationClient } from './integration'
import { NotionClient } from './notion'
import { PocketClient } from './pocket'
import { ReadwiseClient } from './readwise'

export const getIntegrationClient = (
  name: string,
  token: string,
  integrationData?: Integration
): IntegrationClient => {
  switch (name.toLowerCase()) {
    case 'readwise':
      return new ReadwiseClient(token)
    case 'pocket':
      return new PocketClient(token)
    case 'notion':
      return new NotionClient(token, integrationData)
    default:
      throw new Error(`Integration client not found: ${name}`)
  }
}

export const deleteIntegrations = async (
  userId: string,
  criteria: string[] | FindOptionsWhere<Integration>
) => {
  return authTrx(async (t) => t.getRepository(Integration).delete(criteria), {
    uid: userId,
  })
}

export const removeIntegration = async (
  integration: Integration,
  userId: string
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).remove(integration),
    {
      uid: userId,
    }
  )
}

export const findIntegration = async (
  where: FindOptionsWhere<Integration> | FindOptionsWhere<Integration>[],
  userId: string
) => {
  return authTrx(
    async (t) =>
      t.getRepository(Integration).findOneBy({
        ...where,
        user: { id: userId },
      }),
    {
      uid: userId,
    }
  )
}

export const findIntegrationByName = async (name: string, userId: string) => {
  return authTrx(
    async (t) =>
      t
        .getRepository(Integration)
        .createQueryBuilder()
        .where({
          user: { id: userId },
        })
        .andWhere('LOWER(name) = LOWER(:name)', { name }) // case insensitive
        .getOne(),
    {
      uid: userId,
    }
  )
}

export const findIntegrations = async (
  userId: string,
  where?: FindOptionsWhere<Integration> | FindOptionsWhere<Integration>[]
) => {
  return authTrx(
    async (t) =>
      t.getRepository(Integration).findBy({
        ...where,
        user: { id: userId },
      }),
    {
      uid: userId,
    }
  )
}

export const saveIntegration = async (
  integration: DeepPartial<Integration>,
  userId: string
) => {
  return authTrx(
    async (t) => {
      const repo = t.getRepository(Integration)
      const newIntegration = await repo.save(integration)
      return repo.findOneByOrFail({ id: newIntegration.id })
    },
    {
      uid: userId,
    }
  )
}

export const updateIntegration = async (
  id: string,
  integration: DeepPartial<Integration>,
  userId: string
) => {
  return authTrx(
    async (t) => t.getRepository(Integration).update(id, integration),
    {
      uid: userId,
    }
  )
}
