import { expect } from 'chai'
import supertest from 'supertest'
import { ApiKey } from '../../src/entity/api_key'
import { User } from '../../src/entity/user'
import { findApiKeys } from '../../src/services/api_key'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

const testAPIKey = (apiKey: string): supertest.Test => {
  const query = `
    query {
      search(first: 1) {
        ... on SearchSuccess {
          edges {
            cursor
          }
        }
        ... on SearchError {
          errorCodes
        }
      }
    }
   `
  return graphqlRequest(query, apiKey)
}

describe('Api Key resolver', () => {
  let authToken: string
  let user: User
  let query: string
  let expiresAt: string
  let name: string
  let apiKeyId: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fake_user')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
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
    let apiKeys = [] as ApiKey[]

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

      apiKeys = await findApiKeys(user.id, undefined, ['id', 'name'])
    })

    it('should get api keys', async () => {
      query = `
      query {
        apiKeys {
          ... on ApiKeysSuccess {
            apiKeys {
              id
              name
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
      expect(response.body.data.apiKeys.apiKeys).to.eql(apiKeys)
    })
  })
})
