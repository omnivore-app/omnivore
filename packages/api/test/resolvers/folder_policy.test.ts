import { expect } from 'chai'
import { FolderPolicyAction } from '../../src/entity/folder_policy'
import { User } from '../../src/entity/user'
import { FolderPolicy } from '../../src/generated/graphql'
import {
  createFolderPolicy,
  deleteFolderPolicy,
  findFolderPolicyById,
} from '../../src/services/folder_policy'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { graphqlRequest, loginAndGetAuthToken } from '../util'

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

      await deleteFolderPolicy(existingPolicy.id)
    })
  })

  describe('Create Folder Policy', () => {
    const mutation = `
      mutation CreateFolderPolicy($input: CreateFolderPolicyInput!) {
        createFolderPolicy(input: $input) {
          ... on CreateFolderPolicySuccess {
            policy {
              id
              folder
              action
              createdAt
              updatedAt
            }
          }
          ... on CreateFolderPolicyError {
            errorCodes
          }
        }
      }
    `

    it('should create a folder policy', async () => {
      const input = {
        folder: 'test-folder',
        action: FolderPolicyAction.ARCHIVE,
        afterDays: 30,
        minimumItems: 10,
      }

      const res = await graphqlRequest(mutation, authToken, { input }).expect(
        200
      )

      const createdPolicy = res.body.data.createFolderPolicy
        .policy as FolderPolicy

      const policy = await findFolderPolicyById(createdPolicy.id)
      expect(policy).to.exist
      expect(policy?.folder).to.equal(input.folder)

      await deleteFolderPolicy(createdPolicy.id)
    })
  })
})
