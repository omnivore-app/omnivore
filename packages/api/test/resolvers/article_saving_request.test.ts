import { User } from '../../src/entity/user'
import {
  ArticleSavingRequestStatus,
  PageContext,
} from '../../src/elastic/types'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import { expect } from 'chai'
import { getPageById } from '../../src/elastic/pages'
import {
  ArticleSavingRequestErrorCode,
  CreateArticleSavingRequestErrorCode,
} from '../../src/generated/graphql'
import 'mocha'

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
        createArticleSavingRequestMutation('https://blog.omnivore.app'),
        authToken
      ).expect(200)

      expect(
        res.body.data.createArticleSavingRequest.articleSavingRequest.status
      ).to.eql(ArticleSavingRequestStatus.Processing)
    })

    it('creates a page in elastic', async () => {
      const res = await graphqlRequest(
        createArticleSavingRequestMutation('https://blog.omnivore.app/1'),
        authToken
      ).expect(200)

      const page = await getPageById(
        res.body.data.createArticleSavingRequest.articleSavingRequest.id
      )
      expect(page?.content).to.eq('Your link is being saved...')
    })

    it('returns an error if the url is invalid', async () => {
      const res = await graphqlRequest(
        createArticleSavingRequestMutation('invalid url'),
        authToken
      ).expect(200)

      expect(res.body.data.createArticleSavingRequest.errorCodes).to.eql([
        CreateArticleSavingRequestErrorCode.BadData,
      ])
    })
  })

  describe('articleSavingRequest', () => {
    let articleSavingRequestId: string

    before(async () => {
      // create article saving request
      const res = await graphqlRequest(
        createArticleSavingRequestMutation('https://blog.omnivore.app/2'),
        authToken
      ).expect(200)
      articleSavingRequestId =
        res.body.data.createArticleSavingRequest.articleSavingRequest.id
    })

    it('returns the article saving request if exists', async () => {
      const res = await graphqlRequest(
        articleSavingRequestQuery(articleSavingRequestId),
        authToken
      ).expect(200)

      expect(res.body.data.articleSavingRequest.articleSavingRequest.id).to.eql(
        articleSavingRequestId
      )
    })

    it('returns not_found if not exists', async () => {
      const res = await graphqlRequest(
        articleSavingRequestQuery('invalid-id'),
        authToken
      ).expect(200)

      expect(res.body.data.articleSavingRequest.errorCodes).to.eql([
        ArticleSavingRequestErrorCode.NotFound,
      ])
    })
  })
})
