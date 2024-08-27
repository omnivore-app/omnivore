import { In, MoreThan } from 'typeorm'
import { Export } from '../entity/export'
import { TaskState } from '../generated/graphql'
import { getRepository } from '../repository'

export const saveExport = async (
  userId: string,
  exportData: Partial<Export>
): Promise<Export> => {
  return getRepository(Export).save({
    ...exportData,
    userId,
  })
}

export const countExportsWithin24Hours = async (
  userId: string
): Promise<number> => {
  return getRepository(Export).countBy({
    userId,
    createdAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    state: In([TaskState.Pending, TaskState.Running, TaskState.Succeeded]),
  })
}

export const findExportById = async (
  id: string,
  userId: string
): Promise<Export | null> => {
  return getRepository(Export).findOneBy({
    id,
    userId,
  })
}
