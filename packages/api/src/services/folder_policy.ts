import { FolderPolicy, FolderPolicyAction } from '../entity/folder_policy'
import { getRepository } from '../repository'

export const createFolderPolicy = async (folderPolicy: {
  userId: string
  folder: string
  action: FolderPolicyAction
  afterDays: number
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
  userId: string,
  folderPolicyId: string,
  update: Partial<FolderPolicy>
) => {
  return getRepository(FolderPolicy).update(
    { id: folderPolicyId, userId },
    update
  )
}

export const deleteFolderPolicy = async (
  userId: string,
  folderPolicyId: string
) => {
  return getRepository(FolderPolicy).delete({
    id: folderPolicyId,
    userId,
  })
}

export const findFolderPolicyById = async (
  userId: string,
  folderPolicyId: string
) => {
  return getRepository(FolderPolicy).findOneBy({ id: folderPolicyId, userId })
}
