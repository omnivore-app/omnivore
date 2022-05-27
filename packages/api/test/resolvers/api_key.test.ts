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

describe('Api Key resolver', () => {
  const username = 'fake_user'

  let authToken: string
  let user: User
  let query: string
  let expiresAt: string
  let name: string
  let apiKeyId: string

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

  describe('generate api key', () => {
    beforeEach(() => {
      query = `
      mutation {
        generateApiKey(input: {
          name: "${name}"
          expiresAt: "${expiresAt}"
        }) {
          ... on GenerateApiKeySuccess {
            apiKey {
              key
            }
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
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.generateApiKey.apiKey.key).to.be.a('string')

        return testAPIKey(response.body.data.generateApiKey.apiKey.key).expect(
          200
        )
      })
    })

    context('when api key is expired', () => {
      before(() => {
        name = 'test-expired'
        expiresAt = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      })

      it('should generate an expired api key', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.generateApiKey.apiKey.key).to.be.a('string')

        return testAPIKey(response.body.data.generateApiKey.apiKey.key).expect(
          500
        )
      })
    })
  })

  describe('revoke api key', () => {
    let apiKey: string

    before(async () => {
      query = `
      mutation {
        generateApiKey(input: {
          name: "test-revoke"
          expiresAt: "${new Date(
            Date.now() + 1000 * 60 * 60 * 24
          ).toISOString()}"
        }) {
          ... on GenerateApiKeySuccess {
            apiKey {
              id
              key
            }
          }
          ... on GenerateApiKeyError {
            errorCodes
          }
        }
      }
    `

      const response = await graphqlRequest(query, authToken)
      apiKey = response.body.data.generateApiKey.apiKey.key
      apiKeyId = response.body.data.generateApiKey.apiKey.id
    })

    it('should revoke an api key', async () => {
      query = `
      mutation {
        revokeApiKey(id: "${apiKeyId}") {
          ... on RevokeApiKeySuccess {
            apiKey {
              id
            }
          }
          ... on RevokeApiKeyError {
            errorCodes
          }
        }
      }
    `

      const response = await graphqlRequest(query, authToken).expect(200)
      expect(response.body.data.revokeApiKey.apiKey.id).to.be.a('string')

      return testAPIKey(apiKey).expect(500)
    })
  })

  describe('get api keys', () => {
    before(async () => {
      name = 'test-get-api-keys'
      query = `
      mutation {
        generateApiKey(input: {
          name: "${name}"
          expiresAt: "${new Date(
            Date.now() + 1000 * 60 * 60 * 24
          ).toISOString()}"
        }) {
          ... on GenerateApiKeySuccess {
            apiKey {
              id
              key
            }
          }
          ... on GenerateApiKeyError {
            errorCodes
          }
        }
      }
    `

      const response = await graphqlRequest(query, authToken)
      apiKeyId = response.body.data.generateApiKey.apiKey.id
    })

    it('should get api keys', async () => {
      query = `
      query {
        apiKeys {
          ... on ApiKeysSuccess {
            apiKeys {
              id
              name
              expiresAt
              usedAt
            }
          }
          ... on ApiKeysError {
            errorCodes
          }
        }
      }
    `

      const response = await graphqlRequest(query, authToken).expect(200)
      expect(response.body.data.apiKeys.apiKeys).to.be.an('array')
      expect(response.body.data.apiKeys.apiKeys[0].id).to.eql(apiKeyId)
      expect(response.body.data.apiKeys.apiKeys[0].name).to.eql(name)
      expect(response.body.data.apiKeys.apiKeys[0].usedAt).to.be.null
    })
  })
})
