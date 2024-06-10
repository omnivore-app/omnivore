import { FolderPolicy, FolderPolicyAction } from '../../entity/folder_policy'
import {
  CreateFolderPolicyError,
  CreateFolderPolicyErrorCode,
  CreateFolderPolicySuccess,
  FolderPoliciesError,
  FolderPoliciesSuccess,
  MutationCreateFolderPolicyArgs,
  MutationUpdateFolderPolicyArgs,
  UpdateFolderPolicyError,
  UpdateFolderPolicyErrorCode,
  UpdateFolderPolicySuccess,
} from '../../generated/graphql'
import {
  createFolderPolicy,
  findFolderPoliciesByUserId,
  findFolderPolicyById,
  updateFolderPolicy,
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

  if (afterDays < 0 || (minimumItems && minimumItems < 0)) {
    return {
      errorCodes: [CreateFolderPolicyErrorCode.BadRequest],
    }
  }

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

export const updateFolderPolicyResolver = authorized<
  Merge<UpdateFolderPolicySuccess, { policy: FolderPolicy }>,
  UpdateFolderPolicyError,
  MutationUpdateFolderPolicyArgs
>(async (_, { input }, { uid }) => {
  const { id, action, afterDays, minimumItems } = input

  if (!action && !afterDays && !minimumItems) {
    return {
      errorCodes: [UpdateFolderPolicyErrorCode.BadRequest],
    }
  }

  if ((afterDays && afterDays < 0) || (minimumItems && minimumItems < 0)) {
    return {
      errorCodes: [UpdateFolderPolicyErrorCode.BadRequest],
    }
  }

  const result = await updateFolderPolicy(uid, id, {
    action: action ? (action as unknown as FolderPolicyAction) : undefined,
    afterDays: afterDays ?? undefined,
    minimumItems: minimumItems ?? undefined,
  })

  if (!result.affected) {
    return {
      errorCodes: [UpdateFolderPolicyErrorCode.Unauthorized],
    }
  }

  const policy = await findFolderPolicyById(uid, id)
  if (!policy) {
    return {
      errorCodes: [UpdateFolderPolicyErrorCode.Unauthorized],
    }
  }

  return {
    policy,
  }
})
