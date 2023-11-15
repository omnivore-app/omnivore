import { createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'
import * as chai from 'chai'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import chaiString from 'chai-string'
import { DeleteAccountErrorCode } from '../../src/generated/graphql'
import { deleteUser } from '../../src/services/user'

chai.use(chaiString)

const deleteAccountRequest = async (authToken: string, userId: string) => {
  const mutation = `
  mutation {
    deleteAccount(
      userID: "${userId}",
    ) {
      ... on DeleteAccountSuccess {
        userID
      }
      ... on DeleteAccountError {
        errorCodes
      }
    }
  }
  `
  return graphqlRequest(mutation, authToken).expect(200)
}

describe('the deleteAccount API', () => {
  let authToken: string
  let user: User

  before(async () => {
    // create test user and login
    user = await createTestUser('newFakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    await deleteUser(user.id)
  })

  context('deleting a user that exists', () => {
    it('should return the user id after a successful user deletion', async () => {
      const res = await deleteAccountRequest(authToken, user.id)
      expect(res.body.data.deleteAccount.userID).to.eql(user.id)
    })
  })

  context('deleting a user that does not exist', () => {
    it('should return a user not found error if user id is invalid', async () => {
      const res = await deleteAccountRequest(authToken, generateFakeUuid())
      expect(res.body.data.deleteAccount.errorCodes).to.contain(
        DeleteAccountErrorCode.UserNotFound
      )
    })
  })
})
