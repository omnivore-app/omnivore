import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { User } from '../../src/entity/user'
import { hashKey } from '../../src/utils/auth'
import 'mocha'

describe('Sanitize Directive', () => {
  const username = 'fake_user'
  const correctPassword = 'fakePassword'

  let authToken: string
  let user: User

  before(async () => {
    const hashedPassword = hashKey(correctPassword)
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
    let bio = ''.padStart(500, '*')
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

    it('responds status code 500 when invalid input', async () => {
      return graphqlRequest(query, authToken).expect(400)
    })
  })
})
