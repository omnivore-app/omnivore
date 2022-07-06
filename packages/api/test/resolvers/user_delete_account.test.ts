import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import * as chai from 'chai'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import chaiString from 'chai-string'
import { DeleteAccountErrorCode } from '../../src/generated/graphql'

chai.use(chaiString)

const deleteAccountRequest = async (authToken: string, userId: string) => {
  const mutation = `
  mutation {
    deleteAccount(
      input: {
        userId: "${userId}",
      }
    ) {
      ... on DeleteAccountSuccess {
        userId
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
  const username = 'fakeUser'
  let authToken: string
  let user: User

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  context('deleting a user that exists', () => {
    it('should return a unauthorized error if authToken is invalid', async () => {
      const res = await deleteAccountRequest('invalid-auth-token', user.id)
      expect(res.body.data.deleteAccount.errorCodes).to.contain(
        DeleteAccountErrorCode.Unauthorized
      )
    })

    it('should return the user id after a successful user deletion', async () => {
      const res = await deleteAccountRequest(authToken, user.id)
      expect(res.body.data.deleteAccount.userId).to.eql(user.id)
    })
  })

  context('deleting a user that does not exist', () => {
    it('should return a user not found error if user id is invalid', async () => {
      const res = await deleteAccountRequest(authToken, 'invalid-user-id')
      expect(res.body.data.deleteAccount.errorCodes).to.contain(
        DeleteAccountErrorCode.UserNotFound
      )
    })
  })
})
