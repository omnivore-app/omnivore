import { FolderPolicy, FolderPolicyAction } from '../../entity/folder_policy'
import {
  CreateFolderPolicyError,
  CreateFolderPolicySuccess,
  FolderPoliciesError,
  FolderPoliciesSuccess,
  MutationCreateFolderPolicyArgs,
} from '../../generated/graphql'
import {
  createFolderPolicy,
  findFolderPoliciesByUserId,
} from '../../services/folder_policy'
import { Merge } from '../../util'
import { authorized } from '../../utils/gql-utils'

type PartialFolderPoliciesSuccess = Merge<
  FolderPoliciesSuccess,
  { policies: FolderPolicy[] }
>
export const folderPoliciesResolver = authorized<
  PartialFolderPoliciesSuccess,
  FolderPoliciesError
>(async (_, __, { uid }) => {
  const policies = await findFolderPoliciesByUserId(uid)

  return {
    policies,
  }
})

export const createFolderPolicyResolver = authorized<
  Merge<CreateFolderPolicySuccess, { policy: FolderPolicy }>,
  CreateFolderPolicyError,
  MutationCreateFolderPolicyArgs
>(async (_, { input }, { uid }) => {
  const { folder, action, afterDays, minimumItems } = input

  const policy = await createFolderPolicy({
    userId: uid,
    folder,
    action: action as unknown as FolderPolicyAction,
    afterDays,
    minimumItems: minimumItems ?? 0,
  })

  return {
    policy,
  }
})
