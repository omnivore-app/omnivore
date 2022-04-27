import { User } from '../../src/entity/user'
import { PageContext, State } from '../../src/elastic/types'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import { expect } from 'chai'
import { describe } from 'mocha'

const articleSavingRequestQuery = (id: string) => `
  query {
    articleSavingRequest(id: "${id}") {
      ... on ArticleSavingRequestSuccess {
        articleSavingRequest {
          id
          status
        }
      }
      ... on ArticleSavingRequestError {
        errorCodes
      }
    }
  }
`

const createArticleSavingRequestMutation = (url: string) => `
  mutation {
    createArticleSavingRequest(input: {
      url: "${url}"
    }) {
      ... on CreateArticleSavingRequestSuccess {
        articleSavingRequest {
          id
          status
        }
      }
      ... on CreateArticleSavingRequestError {
        errorCodes
      }
    }
  }
`

describe('ArticleSavingRequest API', () => {
  const username = 'fakeUser'
  let authToken: string
  let user: User
  let ctx: PageContext

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    ctx = {
      pubsub: createPubSubClient(),
      refresh: true,
      uid: user.id,
    }
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  describe('createArticleSavingRequest', () => {
    it('returns the article saving request', async () => {
      const res = await graphqlRequest(
        createArticleSavingRequestMutation('https://example.com'),
        authToken
      ).expect(200)

      expect(
        res.body.data.createArticleSavingRequest.articleSavingRequest.status
      ).to.eql(State.Processing)
    })
  })

  describe('articleSavingRequest', () => {
    let articleSavingRequestId: string

    before(async () => {
      // create article saving request
      const res = await graphqlRequest(
        createArticleSavingRequestMutation('https://example.com/1'),
        authToken
      ).expect(200)
      articleSavingRequestId =
        res.body.data.createArticleSavingRequest.articleSavingRequest.id
    })

    it('returns the article saving request', async () => {
      const res = await graphqlRequest(
        articleSavingRequestQuery(articleSavingRequestId),
        authToken
      ).expect(200)

      expect(res.body.data.articleSavingRequest.articleSavingRequest.id).to.eq(
        articleSavingRequestId
      )
    })
  })
})
