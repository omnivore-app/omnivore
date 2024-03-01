import 'mocha'
import { User } from '../../src/entity/user'
import { deleteUser } from '../../src/services/user'
import { hashPassword } from '../../src/utils/auth'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

describe('Sanitize Directive', () => {
  const correctPassword = 'fakePassword'

  let authToken: string
  let user: User

  before(async () => {
    const hashedPassword = await hashPassword(correctPassword)
    user = await createTestUser('fake_user', '', hashedPassword)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    await deleteUser(user.id)
  })

  describe('Update user with a bio that is too long', () => {
    const bio = ''.padStart(500, '*')
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
