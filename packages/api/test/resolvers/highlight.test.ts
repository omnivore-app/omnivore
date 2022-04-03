import { createTestUser, deleteTestUser } from '../db'
import {
  createTestElasticPage,
  generateFakeUuid,
  graphqlRequest,
  request,
} from '../util'
import * as chai from 'chai'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import chaiString from 'chai-string'
import { deletePage } from '../../src/elastic'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import { PageContext } from '../../src/elastic/types'

chai.use(chaiString)

const createHighlightQuery = (
  authToken: string,
  linkId: string,
  highlightId: string,
  shortHighlightId: string,
  prefix = '_prefix',
  suffix = '_suffix',
  quote = '_quote',
  patch = '_patch'
) => {
  return `
  mutation {
    createHighlight(
      input: {
        prefix: "${prefix}",
        suffix: "${suffix}",
        quote: "${quote}",
        id: "${highlightId}",
        shortId: "${shortHighlightId}",
        patch: "${patch}",
        articleId: "${linkId}",
      }
    ) {
      ... on CreateHighlightSuccess {
        highlight {
          id
        }
      }
      ... on CreateHighlightError {
        errorCodes
      }
    }
  }
  `
}

const mergeHighlightQuery = (
  pageId: string,
  highlightId: string,
  shortHighlightId: string,
  overlapHighlightIdList: string[],
  prefix = '_prefix',
  suffix = '_suffix',
  quote = '_quote',
  patch = '_patch'
) => {
  return `
  mutation {
    mergeHighlight(
      input: {
        prefix: "${prefix}",
        suffix: "${suffix}",
        quote: "${quote}",
        id: "${highlightId}",
        shortId: "${shortHighlightId}",
        patch: "${patch}",
        articleId: "${pageId}",
        overlapHighlightIdList: "${overlapHighlightIdList}"
      }
    ) {
      ... on MergeHighlightSuccess {
        highlight {
          id
        }
      }
      ... on MergeHighlightError {
        errorCodes
      }
    }
  }
  `
}

describe('Highlights API', () => {
  const username = 'fakeUser'
  let authToken: string
  let user: User
  let pageId: string
  let ctx: PageContext

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
    pageId = (await createTestElasticPage(user)).id
    ctx = { pubsub: createPubSubClient(), uid: user.id }
  })

  after(async () => {
    await deleteTestUser(username)
    if (pageId) {
      await deletePage(pageId, ctx)
    }
  })

  context('createHighlightMutation', () => {
    it('should not fail', async () => {
      const highlightId = generateFakeUuid()
      const shortHighlightId = '_short_id'
      const query = createHighlightQuery(
        authToken,
        pageId,
        highlightId,
        shortHighlightId
      )
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.createHighlight.highlight.id).to.eq(highlightId)
    })
  })

  context('mergeHighlightMutation', () => {
    let highlightId: string

    before(async () => {
      // create test highlight
      highlightId = generateFakeUuid()
      const shortHighlightId = '_short_id_1'
      const query = createHighlightQuery(
        authToken,
        pageId,
        highlightId,
        shortHighlightId
      )
      await graphqlRequest(query, authToken).expect(200)
    })

    it('should not fail', async () => {
      const newHighlightId = generateFakeUuid()
      const newShortHighlightId = '_short_id_2'
      const query = mergeHighlightQuery(
        pageId,
        newHighlightId,
        newShortHighlightId,
        [highlightId]
      )
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.mergeHighlight.highlight.id).to.eq(newHighlightId)
    })
  })
})
