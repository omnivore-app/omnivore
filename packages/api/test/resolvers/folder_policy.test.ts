import { expect } from 'chai'
import {
  FolderPolicy as FolderPolicyEntity,
  FolderPolicyAction,
} from '../../src/entity/folder_policy'
import { User } from '../../src/entity/user'
import {
  DeleteFolderPolicySuccess,
  FolderPolicy,
} from '../../src/generated/graphql'
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

    it('should return a list of folder policy of the user in ascending order', async () => {
      const existingPolicy = await createFolderPolicy({
        userId: loginUser.id,
        folder: 'inbox',
        action: FolderPolicyAction.Archive,
        afterDays: 30,
      })
      const existingPolicy1 = await createFolderPolicy({
        userId: loginUser.id,
        folder: 'following',
        action: FolderPolicyAction.Archive,
        afterDays: 30,
      })

      const res = await graphqlRequest(query, authToken).expect(200)

      const policies = res.body.data.folderPolicies
        .policies as Array<FolderPolicy>
      expect(policies).to.have.lengthOf(2)
      expect(policies[0].id).to.equal(existingPolicy1.id)
      expect(policies[1].id).to.equal(existingPolicy.id)

      await deleteFolderPolicy(loginUser.id, existingPolicy.id)
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
        action: FolderPolicyAction.Archive,
        afterDays: 30,
      }

      const res = await graphqlRequest(mutation, authToken, { input }).expect(
        200
      )

      const createdPolicy = res.body.data.createFolderPolicy
        .policy as FolderPolicy

      const policy = await findFolderPolicyById(loginUser.id, createdPolicy.id)
      expect(policy).to.exist
      expect(policy?.folder).to.equal(input.folder)

      await deleteFolderPolicy(loginUser.id, createdPolicy.id)
    })
  })

  describe('Update Folder Policy', () => {
    let existingPolicy: FolderPolicyEntity

    before(async () => {
      existingPolicy = await createFolderPolicy({
        userId: loginUser.id,
        folder: 'test-folder',
        action: FolderPolicyAction.Archive,
        afterDays: 30,
      })
    })

    after(async () => {
      await deleteFolderPolicy(loginUser.id, existingPolicy.id)
    })

    const mutation = `
      mutation UpdateFolderPolicy($input: UpdateFolderPolicyInput!) {
        updateFolderPolicy(input: $input) {
          ... on UpdateFolderPolicySuccess {
            policy {
              id
              folder
              action
              createdAt
              updatedAt
            }
          }
          ... on UpdateFolderPolicyError {
            errorCodes
          }
        }
      }
    `

    it('should update a folder policy', async () => {
      const input = {
        id: existingPolicy.id,
        action: FolderPolicyAction.Delete,
        afterDays: 30,
      }

      const res = await graphqlRequest(mutation, authToken, { input }).expect(
        200
      )

      const updatedPolicy = res.body.data.updateFolderPolicy
        .policy as FolderPolicy

      const policy = await findFolderPolicyById(loginUser.id, updatedPolicy.id)
      expect(policy).to.exist
      expect(policy?.action).to.equal(input.action)
    })
  })

  describe('Delete Folder Policy', () => {
    let existingPolicy: FolderPolicyEntity

    before(async () => {
      existingPolicy = await createFolderPolicy({
        userId: loginUser.id,
        folder: 'test-folder',
        action: FolderPolicyAction.Archive,
        afterDays: 30,
      })
    })

    const mutation = `
      mutation DeleteFolderPolicy($id: ID!) {
        deleteFolderPolicy(id: $id) {
          ... on DeleteFolderPolicySuccess {
            success
          }
          ... on DeleteFolderPolicyError {
            errorCodes
          }
        }
      }
    `

    it('should delete a folder policy', async () => {
      const res = await graphqlRequest(mutation, authToken, {
        id: existingPolicy.id,
      }).expect(200)

      const result = res.body.data
        .deleteFolderPolicy as DeleteFolderPolicySuccess
      expect(result.success).to.be.true
    })
  })
})
