import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { expect } from 'chai'

describe('generate api key', () => {
  const username = 'fake_user'

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

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  it('should return api key', async () => {
    const query = `
      mutation {
        generateApiKey {
          ... on GenerateApiKeySuccess {
            apiKey
          }
          ... on GenerateApiKeyError {
            errorCodes
          }
        }
      }
    `
    const response = await graphqlRequest(query, authToken).expect(200)
    expect(response.body.data.generateApiKey.apiKey).to.be.a('string')
  })
})
