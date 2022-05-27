import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { expect } from 'chai'
import supertest from 'supertest'

const testAPIKey = (apiKey: string): supertest.Test => {
  const query = `
    query {
      articles(first: 1) {
        ... on ArticlesSuccess {
          edges {
            cursor
          }
        }
        ... on ArticlesError {
          errorCodes
        }
      }
    }
   `
  return graphqlRequest(query, apiKey)
}

describe('generate api key', () => {
  const username = 'fake_user'

  let authToken: string
  let user: User
  let query: string
  let expiresAt: string
  let name: string

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

  beforeEach(() => {
    query = `
      mutation {
        generateApiKey(input: {
          name: "${name}"
          expiresAt: "${expiresAt}"
        }) {
          ... on GenerateApiKeySuccess {
            apiKey
          }
          ... on GenerateApiKeyError {
            errorCodes
          }
        }
      }
    `
  })

  context('when api key is not expired', () => {
    before(() => {
      name = 'test'
      expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
    })

    it('should generate an api key', async () => {
      const response = await graphqlRequest(query, authToken)
      expect(response.body.data.generateApiKey.apiKey).to.be.a('string')

      return testAPIKey(response.body.data.generateApiKey.apiKey).expect(200)
    })
  })

  context('when api key is expired', () => {
    before(() => {
      name = 'test-expired'
      expiresAt = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    })

    it('should generate an expired api key', async () => {
      const response = await graphqlRequest(query, authToken)
      expect(response.body.data.generateApiKey.apiKey).to.be.a('string')

      return testAPIKey(response.body.data.generateApiKey.apiKey).expect(500)
    })
  })
})
