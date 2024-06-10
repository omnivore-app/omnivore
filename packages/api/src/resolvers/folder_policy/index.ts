import { FolderPolicy } from '../../entity/folder_policy'
import {
  FolderPoliciesError,
  FolderPoliciesSuccess,
} from '../../generated/graphql'
import { findFolderPoliciesByUserId } from '../../services/folder_policy'
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
