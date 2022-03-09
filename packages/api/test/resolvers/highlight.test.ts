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

describe('Highlights API', () => {
  const username = 'fakeUser'
  let authToken: string
  let user: User
  let pageId: string

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
    pageId = (await createTestElasticPage(user)).id
  })

  after(async () => {
    await deleteTestUser(username)
    if (pageId) {
      await deletePage(pageId)
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
})
