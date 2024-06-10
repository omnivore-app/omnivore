import { FolderPolicy, FolderPolicyAction } from '../entity/folder_policy'
import { getRepository } from '../repository'

export const createFolderPolicy = async (folderPolicy: {
  userId: string
  folder: string
  action: FolderPolicyAction
  afterDays: number
  minimumItems: number
}) => {
  return getRepository(FolderPolicy).save(folderPolicy)
}

export const findFolderPoliciesByUserId = async (userId: string) => {
  return getRepository(FolderPolicy).find({
    where: { userId },
    order: { folder: 'ASC' },
  })
}

export const updateFolderPolicy = async (
  id: string,
  update: Partial<FolderPolicy>
) => {
  return getRepository(FolderPolicy).update(id, update)
}

export const deleteFolderPolicy = async (id: string) => {
  return getRepository(FolderPolicy).delete(id)
}

export const findFolderPolicies = async () => {
  return getRepository(FolderPolicy).find()
}

export const findFolderPolicyById = async (id: string) => {
  return getRepository(FolderPolicy).findOneBy({ id })
}
