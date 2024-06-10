import { FolderPolicyAction } from '../../src/entity/folder_policy'
import { User } from '../../src/entity/user'
import { createFolderPolicy } from '../../src/services/folder_policy'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { graphqlRequest, loginAndGetAuthToken } from '../util'
import { expect } from 'chai'

describe('Folder Policy API', () => {
  let loginUser: User
  let authToken: string

  before(async () => {
    // create test user and login
    loginUser = await createTestUser('loginUser')
    authToken = await loginAndGetAuthToken(loginUser.email)
  })

  after(async () => {
    await deleteUser(loginUser.id)
  })

  describe('List Folder Policy', () => {
    const query = `
      query {
        folderPolicies {
          ... on FolderPoliciesSuccess {
            policies {
              id
              folder
              action
              createdAt
              updatedAt
            }
          }
          ... on FolderPoliciesError {
            errorCodes
          }
        }
      }
    `

    it('should return a list of folder policy of the user', async () => {
      const existingPolicy = await createFolderPolicy({
        userId: loginUser.id,
        folder: 'test-folder',
        action: FolderPolicyAction.ARCHIVE,
        afterDays: 30,
        minimumItems: 10,
      })

      const res = await graphqlRequest(query, authToken).expect(200)

      const policies = res.body.data.folderPolicies.policies as any[]
      expect(policies).to.have.lengthOf(1)
      expect(policies[0].id).to.equal(existingPolicy.id)
    })
  })
})
