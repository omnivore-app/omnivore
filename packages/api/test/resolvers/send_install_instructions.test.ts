import 'mocha'
import { User } from '../../src/entity/user'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

describe('Send Install Instructions API', () => {
  let authToken: string
  let user: User

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('Send install instructions', () => {
    const query = `
      query SendInstallInstructions {
        sendInstallInstructions {
          ... on SendInstallInstructionsSuccess {
        sent
          }
        }

      sendInstallInstructions {
          ... on SendInstallInstructionsError {
        errorCodes
          }
        }
      }
    `

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        query {
          sendInstallInstructions {
          }
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })
})
