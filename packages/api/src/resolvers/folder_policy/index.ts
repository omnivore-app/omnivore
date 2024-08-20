import { FolderPolicy, FolderPolicyAction } from '../../entity/folder_policy'
import {
  CreateFolderPolicyError,
  CreateFolderPolicyErrorCode,
  CreateFolderPolicySuccess,
  DeleteFolderPolicyError,
  DeleteFolderPolicySuccess,
  FolderPoliciesError,
  FolderPoliciesSuccess,
  MutationCreateFolderPolicyArgs,
  MutationDeleteFolderPolicyArgs,
  MutationUpdateFolderPolicyArgs,
  UpdateFolderPolicyError,
  UpdateFolderPolicyErrorCode,
  UpdateFolderPolicySuccess,
} from '../../generated/graphql'
import {
  createFolderPolicy,
  deleteFolderPolicy,
  findFolderPoliciesByUserId,
  findFolderPolicyById,
  updateFolderPolicy,
} from '../../services/folder_policy'
import { Merge } from '../../util'
import { authorized } from '../../utils/gql-utils'

type PartialFolderPoliciesSuccess = Merge<
  FolderPoliciesSuccess,
  { policies: Array<FolderPolicy> }
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
>(async (_, { input }, { uid, log }) => {
  const { folder, action, afterDays } = input

  if (afterDays < 0) {
    log.error('Invalid values')

    return {
      errorCodes: [CreateFolderPolicyErrorCode.BadRequest],
    }
  }

  const policy = await createFolderPolicy({
    userId: uid,
    folder,
    action: action as unknown as FolderPolicyAction,
    afterDays,
  })

  return {
    policy,
  }
})

export const updateFolderPolicyResolver = authorized<
  Merge<UpdateFolderPolicySuccess, { policy: FolderPolicy }>,
  UpdateFolderPolicyError,
  MutationUpdateFolderPolicyArgs
>(async (_, { input }, { log, uid }) => {
  const { id, action, afterDays } = input

  if (!action && !afterDays) {
    log.error('No fields to update')

    return {
      errorCodes: [UpdateFolderPolicyErrorCode.BadRequest],
    }
  }

  if (afterDays && afterDays < 0) {
    log.error('Invalid values')

    return {
      errorCodes: [UpdateFolderPolicyErrorCode.BadRequest],
    }
  }

  const result = await updateFolderPolicy(uid, id, {
    action: action ? (action as unknown as FolderPolicyAction) : undefined,
    afterDays: afterDays ?? undefined,
  })

  if (!result.affected) {
    log.error('Policy not found')

    return {
      errorCodes: [UpdateFolderPolicyErrorCode.Unauthorized],
    }
  }

  const policy = await findFolderPolicyById(uid, id)
  if (!policy) {
    log.error('Policy not found')

    return {
      errorCodes: [UpdateFolderPolicyErrorCode.Unauthorized],
    }
  }

  return {
    policy,
  }
})

export const deleteFolderPolicyResolver = authorized<
  DeleteFolderPolicySuccess,
  DeleteFolderPolicyError,
  MutationDeleteFolderPolicyArgs
>(async (_, { id }, { uid }) => {
  const result = await deleteFolderPolicy(uid, id)

  return {
    success: !!result.affected,
  }
})
