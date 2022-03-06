import { createTestLabel, createTestUser, deleteTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'
import * as chai from 'chai'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import chaiString from 'chai-string'
import { Label } from '../../src/entity/label'
import { createPage, deletePage, Page, updatePage } from '../../src/elastic'
import { PageType } from '../../src/generated/graphql'

chai.use(chaiString)

const archiveLink = async (authToken: string, linkId: string) => {
  const query = `
  mutation {
    setLinkArchived(
      input: {
        linkId: "${linkId}",
        archived: ${true}
      }
    ) {
      ... on ArchiveLinkSuccess {
        linkId
      }
      ... on ArchiveLinkError {
        errorCodes
      }
    }
  }
  `
  return graphqlRequest(query, authToken).expect(200)
}

const createArticleQuery = (
  url: string,
  source: string,
  document: string,
  title: string
) => {
  return `
  mutation {
    createArticle(input: {
      url: "${url}"
      source: "${source}"
      preparedDocument: {
        document: "${document}"
        pageInfo: {
          contentType: "text/html"
          title: "${title}"
        }
      }
    }) {
      ... on CreateArticleSuccess {
        createdArticle {
          id
          title
          content
        }
        user {
          id
          name
        }
        created
      }
      ... on CreateArticleError {
        errorCodes
      }
    }
  }
  `
}

const articlesQuery = (after = '', order = 'ASCENDING') => {
  return `
  query {
    articles(
      sharedOnly: ${false}
      sort: {
        order: ${order}
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
            url
            linkId
            labels {
              id
              name
              color
            }
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
}

const savePageQuery = (url: string, title: string, originalContent: string) => {
  return `
    mutation {
      savePage(
        input: {
          url: "${url}",
          source: "test",
          clientRequestId: "${generateFakeUuid()}",
          title: "${title}",
          originalContent: "${originalContent}"
        }
      ) {
        ... on SaveSuccess {
          url
        }
        ... on SaveError {
          errorCodes
        }
      }
    }
    `
}

describe('Article API', () => {
  const username = 'fakeUser'
  let authToken: string
  let user: User
  let pages: Page[] = []
  let label: Label

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    // Create some test pages
    for (let i = 0; i < 15; i++) {
      const page = {
        id: '',
        hash: 'test hash',
        userId: user.id,
        pageType: PageType.Article,
        title: 'test title',
        content: '<p>test</p>',
        slug: 'test slug',
        createdAt: new Date(),
        updatedAt: new Date(),
        readingProgress: 100,
        readingProgressAnchorIndex: 0,
        url: 'https://blog.omnivore.app/p/getting-started-with-omnivore',
        savedAt: new Date(),
      } as Page
      const pageId = await createPage(page)
      if (!pageId) {
        expect.fail('Failed to create page')
      }
      page.id = pageId
      pages.push(page)
    }
    //  create testing labels
    label = await createTestLabel(user, 'label', '#ffffff')
    //  set label to a link
    await updatePage(pages[0].id, {
      ...pages[0],
      labels: [{ id: label.id, name: label.name, color: label.color }],
    })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    for (const page of pages) {
      await deletePage(page.id)
    }
    await deleteTestUser(username)
  })

  describe('CreateArticle', () => {
    let query = ''
    let url = ''
    let source = ''
    let document = ''
    let title = ''
    let pageId = ''

    beforeEach(async () => {
      query = createArticleQuery(url, source, document, title)
    })

    context('when saving from document', () => {
      url = 'https://blog.omnivore.app/p/getting-started-with-omnivore'
      source = 'puppeteer-parse'
      document = '<p>test</p>'
      title = 'new title'

      after(async () => {
        await deletePage(pageId)
      })

      it('should create an article', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.createArticle.createdArticle.title).to.eql(title)
        pageId = res.body.data.createArticle.createdArticle.id
      })
    })
  })

  describe('GetArticles', () => {
    let query = ''
    let after = ''

    beforeEach(async () => {
      query = articlesQuery(after)
    })

    it('should return labels', async () => {
      const res = await graphqlRequest(query, authToken).expect(200)
      console.log(res.body.data.articles.edges[0].node)

      expect(res.body.data.articles.edges[0].node.labels[0].id).to.eql(label.id)
    })

    context('when we fetch the first page', () => {
      it('should return the first five items', async () => {
        after = ''
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.articles.edges.length).to.eql(5)
        expect(res.body.data.articles.edges[0].node.id).to.eql(pages[0].id)
        expect(res.body.data.articles.edges[1].node.id).to.eql(pages[1].id)
        expect(res.body.data.articles.edges[2].node.id).to.eql(pages[2].id)
        expect(res.body.data.articles.edges[3].node.id).to.eql(pages[3].id)
        expect(res.body.data.articles.edges[4].node.id).to.eql(pages[4].id)
      })

      it('should set the pageInfo', async () => {
        after = ''
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.articles.pageInfo.endCursor).to.eql('5')
        expect(res.body.data.articles.pageInfo.startCursor).to.eql('')
        expect(res.body.data.articles.pageInfo.totalCount, 'totalCount').to.eql(
          15
        )
        expect(
          res.body.data.articles.pageInfo.hasNextPage,
          'hasNextPage'
        ).to.eql(true)
      })
    })

    context('when we fetch the second page', () => {
      before(() => {
        after = '5'
      })

      it('should return the second five items', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.articles.edges.length).to.eql(5)
        expect(res.body.data.articles.edges[0].node.id).to.eql(pages[5].id)
        expect(res.body.data.articles.edges[1].node.id).to.eql(pages[6].id)
        expect(res.body.data.articles.edges[2].node.id).to.eql(pages[7].id)
        expect(res.body.data.articles.edges[3].node.id).to.eql(pages[8].id)
        expect(res.body.data.articles.edges[4].node.id).to.eql(pages[9].id)
      })

      it('should set the pageInfo', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.articles.pageInfo.totalCount, 'totalCount').to.eql(
          15
        )
        expect(
          res.body.data.articles.pageInfo.startCursor,
          'startCursor'
        ).to.eql('5')
        expect(res.body.data.articles.pageInfo.endCursor, 'endCursor').to.eql(
          '10'
        )
        expect(
          res.body.data.articles.pageInfo.hasNextPage,
          'hasNextPage'
        ).to.eql(true)
        // We don't implement hasPreviousPage in the API and should probably remove it
        // expect(res.body.data.articles.pageInfo.hasPreviousPage).to.eql(true)
      })
    })
  })

  describe('SavePage', () => {
    let query = ''
    let title = 'Example Title'
    let url = 'https://example.com'
    let originalContent = '<div>Example Content</div>'

    beforeEach(() => {
      query = savePageQuery(url, title, originalContent)
    })

    context('when we save a new page', () => {
      it('should return a slugged url', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.savePage.url).to.startsWith(
          'http://localhost:3000/fakeUser/example-title-'
        )
      })
    })

    context('when we save a page that is already archived', () => {
      it('it should return that page in the GetArticles Query', async () => {
        url = 'https://example.com/new-url'
        await graphqlRequest(
          savePageQuery(url, title, originalContent),
          authToken
        ).expect(200)

        // Save a link, then archive it
        let allLinks = await graphqlRequest(
          articlesQuery('', 'DESCENDING'),
          authToken
        ).expect(200)
        const justSavedId = allLinks.body.data.articles.edges[0].node.id
        await archiveLink(authToken, justSavedId)

        // test the negative case, ensuring the archive link wasn't returned
        allLinks = await graphqlRequest(
          articlesQuery('', 'DESCENDING'),
          authToken
        ).expect(200)
        expect(allLinks.body.data.articles.edges[0].node.url).to.not.eq(url)

        // Now save the link again, and ensure it is returned
        const resaved = await graphqlRequest(
          savePageQuery(url, title, originalContent),
          authToken
        ).expect(200)
        allLinks = await graphqlRequest(
          articlesQuery('', 'DESCENDING'),
          authToken
        ).expect(200)
        expect(allLinks.body.data.articles.edges[0].node.url).to.eq(url)
      })
    })
  })
})
