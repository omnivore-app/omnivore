import { createTestUser, deleteTestUser, getProfile, getUser } from '../db'
import { graphqlRequest, request } from '../util'
import { expect } from 'chai'
import {
  LoginErrorCode,
  SignupErrorCode,
  UpdateUserErrorCode,
  UpdateUserProfileErrorCode,
} from '../../src/generated/graphql'
import { User } from '../../src/entity/user'
import { hashPassword } from '../../src/utils/auth'
import 'mocha'

describe('Sanitize Directive', () => {
  const username = 'fake_user'
  const correctPassword = 'fakePassword'

  let authToken: string
  let user: User

  before(async () => {
    const hashedPassword = hashPassword(correctPassword)
    user = await createTestUser(username, '', hashedPassword)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    await deleteTestUser(username)
  })

  describe('Update user with a bio that is too long', () => {
    let bio = "".padStart(500, '*');
    let query: string

    beforeEach(() => {
      query = `
        mutation {
          updateUser(
            input: {
              name: "fakeUser"
              bio: "${bio}"
            }
          ) {
            ... on UpdateUserSuccess {
              user {
                id
              }
            }
            ... on UpdateUserError {
              errorCodes
            }
          }
        }
      `
    })

    it('responds with error code EMPTY_NAME', async () => {
      expect(async () => { await graphqlRequest(query, authToken) }).to.throw
    })
  })
})
