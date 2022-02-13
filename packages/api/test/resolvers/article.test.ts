import { createTestLink, createTestPage, createTestUser, deleteTestUser } from "../db"
import { graphqlRequest, request } from "../util"
import { expect } from "chai"
import { Page } from "../../src/entity/page"

describe('Article API', () => {
  const username = 'fakeUser'

  let authToken: string
  let links: Page[] = []

  before(async () => {
    // create test user and login
    const user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    for (let i = 0; i < 15; i++) {
      const page = await createTestPage()
      await createTestLink(user, page)
      links.push(page)
    }
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  describe('GetArticles', () => {
    let query = ''
    let after = ''

    beforeEach(() => {
      query = `
      query {
        articles(
          sharedOnly: ${false}
          sort: {
            order: ASCENDING
            by: UPDATED_TIME
          }
          after: "${after}"
          first: 5
          query: "") {
          ... on ArticlesSuccess {
            edges {
              cursor
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
              totalCount
            }
          }
          ... on ArticlesError {
            errorCodes
          }
        }
      }
      `
    })

    context('when we fetch the first page', () => {
      it('should return the first five items', async () => {
        after = ''
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.articles.edges.length).to.eql(5)
        expect(res.body.data.articles.edges[0].node.id).to.eql(links[0].id)
        expect(res.body.data.articles.edges[1].node.id).to.eql(links[1].id)
        expect(res.body.data.articles.edges[2].node.id).to.eql(links[2].id)
        expect(res.body.data.articles.edges[3].node.id).to.eql(links[3].id)
        expect(res.body.data.articles.edges[4].node.id).to.eql(links[4].id)
      })

      it('should set the pageInfo', async () => {
        after = ''
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.articles.pageInfo.endCursor).to.eql('5')
        expect(res.body.data.articles.pageInfo.startCursor).to.eql('')
        expect(res.body.data.articles.pageInfo.totalCount, 'totalCount').to.eql(15)
        expect(res.body.data.articles.pageInfo.hasNextPage, 'hasNextPage').to.eql(true)
      })
    })

    context('when we fetch the second page', () => {
      before(async () => {
        after = '5'
      })

      it('should return the second five items', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.articles.edges.length).to.eql(5)
        expect(res.body.data.articles.edges[0].node.id).to.eql(links[5].id)
        expect(res.body.data.articles.edges[1].node.id).to.eql(links[6].id)
        expect(res.body.data.articles.edges[2].node.id).to.eql(links[7].id)
        expect(res.body.data.articles.edges[3].node.id).to.eql(links[8].id)
        expect(res.body.data.articles.edges[4].node.id).to.eql(links[9].id)
      })

      it('should set the pageInfo', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.articles.pageInfo.totalCount, 'totalCount').to.eql(15)
        expect(res.body.data.articles.pageInfo.startCursor, 'startCursor').to.eql('5')
        expect(res.body.data.articles.pageInfo.endCursor, 'endCursor').to.eql('10')
        expect(res.body.data.articles.pageInfo.hasNextPage, 'hasNextPage').to.eql(true)
        // We don't implement hasPreviousPage in the API and should probably remove it
        // expect(res.body.data.articles.pageInfo.hasPreviousPage).to.eql(true)
      })
    })
  })
})
