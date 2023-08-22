import {
  createTestLink,
  createTestPage,
  createTestUser,
  deleteTestUser,
} from '../db'
import { graphqlRequest, request } from '../util'
import { expect } from 'chai'
import { SharedArticleErrorCode } from '../../src/generated/graphql'
import { Page } from '../../src/entity/page'
import { Link } from '../../src/entity/link'
import { Highlight } from '../../src/entity/highlight'
import 'mocha'
import { getRepository } from '../../src/entity'
import { User } from '../../src/entity/user'

describe('User feed article API', () => {
  const existingUsername = 'fakeUser'
  let user: User
  let authToken: string
  let page: Page
  let link: Link
  let highlight: Highlight

  before(async () => {
    // create test user and login
    user = await createTestUser(existingUsername)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    page = await createTestPage()
    link = await createTestLink(user, page)
    highlight = await getRepository(Highlight).save({
      page: page,
      text: 'test',
      user: user,
      shortId: 'test',
      patch: 'test',
      quote: 'test',
    })
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
  })

  describe('get shared article', () => {
    let username = 'someUser'
    let slug = 'Some slug'
    let selectedHighlightId = 'some-highlight-id'
    let query: string

    beforeEach(() => {
      query = `
        query {
          sharedArticle(
            username: "${username}"
            slug: "${slug}"
            selectedHighlightId: "${selectedHighlightId}"  
          ) {
            ... on SharedArticleSuccess {
              article {
                id
              }
            }
            ... on SharedArticleError {
              errorCodes
            }
          }
        }
      `
    })

    context('when user not exists', () => {
      before(() => {
        username = 'notExists'
      })

      it('should responds NotFound', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.sharedArticle.errorCodes).to.eql([
          SharedArticleErrorCode.NotFound,
        ])
      })
    })

    context('when article not exists', () => {
      before(() => {
        username = existingUsername
        slug = 'notExists'
      })

      it('should responds NotFound', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.sharedArticle.errorCodes).to.eql([
          SharedArticleErrorCode.NotFound,
        ])
      })
    })

    context('when article exists but not shared', () => {
      before(() => {
        username = existingUsername
        slug = link.slug
      })

      it('should responds NotFound', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.sharedArticle.errorCodes).to.eql([
          SharedArticleErrorCode.NotFound,
        ])
      })
    })

    context('when article exists but highlight not exists', () => {
      before(() => {
        username = existingUsername
        slug = link.slug
        selectedHighlightId = 'NotExists'
      })

      it('should responds NotFound', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.sharedArticle.errorCodes).to.eql([
          SharedArticleErrorCode.NotFound,
        ])
      })
    })

    context('when highlight exists but not shared', () => {
      before(() => {
        username = existingUsername
        slug = link.slug
        selectedHighlightId = highlight.id || 'some-highlight-id'
      })

      it('should responds NotFound', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.sharedArticle.errorCodes).to.eql([
          SharedArticleErrorCode.NotFound,
        ])
      })
    })

    context('when article exists and shared', () => {
      before(async () => {
        username = existingUsername
        slug = link.slug
        selectedHighlightId = ''
        await getRepository(Link).update(link.id, {
          sharedAt: new Date(),
        })
      })

      after(async () => {
        await getRepository(Link).update(link.id, {
          sharedAt: null,
        })
      })

      // TODO: add test for shared article when shared article api is ready
      xit('should responds SharedArticleSuccess', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.sharedArticle.article.id).to.eql(page.id)
      })
    })
  })
})
