import { expect } from 'chai'
import 'mocha'
import sinon from 'sinon'
import { createPubSubClient } from '../../src/pubsub'
import { deletePagesByParam, getPageByParam } from '../../src/elastic/pages'
import {
  ArticleSavingRequestStatus,
  PageContext,
} from '../../src/elastic/types'
import { User } from '../../src/entity/user'
import {
  ArticleSavingRequestErrorCode,
  CreateArticleSavingRequestErrorCode,
} from '../../src/generated/graphql'
import * as createTask from '../../src/utils/createTask'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'

const articleSavingRequestQuery = ({
  id,
  url,
}: {
  id?: string
  url?: string
}) => `
  query {
    articleSavingRequest(id: ${id ? `"${id}"` : null}, url: ${
  url ? `"${url}"` : null
}) {
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
          url
        }
      }
      ... on CreateArticleSavingRequestError {
        errorCodes
      }
    }
  }
`

describe('ArticleSavingRequest API', () => {
  let authToken: string
  let user: User
  let ctx: PageContext

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    ctx = {
      pubsub: createPubSubClient(),
      refresh: true,
      uid: user.id,
    }
    sinon.replace(createTask, 'enqueueParseRequest', sinon.fake.resolves(''))
  })

  after(async () => {
    // clean up
    await deletePagesByParam({ userId: user.id }, ctx)
    await deleteTestUser(user.id)
    sinon.restore()
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
      const url = 'https://blog.omnivore.app/1'
      await graphqlRequest(
        createArticleSavingRequestMutation('https://blog.omnivore.app/1'),
        authToken
      ).expect(200)

      const page = await getPageByParam({ url })
      expect(page?.content).to.eql('Your link is being saved...')
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
    let url: string
    let id: string

    before(async () => {
      url = 'https://blog.omnivore.app/2'
      // create article saving request
      const res = await graphqlRequest(
        createArticleSavingRequestMutation(url),
        authToken
      ).expect(200)
      id = res.body.data.createArticleSavingRequest.articleSavingRequest.id
    })

    it('returns the article saving request if exists', async () => {
      const res = await graphqlRequest(
        articleSavingRequestQuery({ url }),
        authToken
      ).expect(200)

      expect(
        res.body.data.articleSavingRequest.articleSavingRequest.status
      ).to.eql(ArticleSavingRequestStatus.Processing)
    })

    it('returns the article saving request by id', async () => {
      const res = await graphqlRequest(
        articleSavingRequestQuery({ id }),
        authToken
      ).expect(200)

      expect(
        res.body.data.articleSavingRequest.articleSavingRequest.status
      ).to.eql(ArticleSavingRequestStatus.Processing)
    })

    it('returns not_found if not exists', async () => {
      const res = await graphqlRequest(
        articleSavingRequestQuery({ id: 'invalid-id' }),
        authToken
      ).expect(200)

      expect(res.body.data.articleSavingRequest.errorCodes).to.eql([
        ArticleSavingRequestErrorCode.NotFound,
      ])
    })
  })
})
