import { createTestLabel, createTestUser, deleteTestUser } from '../db'
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
import { Label } from '../../src/entity/label'
import { UploadFileStatus } from '../../src/generated/graphql'
import { Highlight, Page, PageContext, PageType } from '../../src/elastic/types'
import { UploadFile } from '../../src/entity/upload_file'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import { getRepository } from '../../src/entity/utils'
import {
  createPage,
  deletePage,
  getPageById,
  updatePage,
} from '../../src/elastic/pages'
import { addHighlightToPage } from '../../src/elastic/highlights'

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
            originalArticleUrl
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

const getArticleQuery = (slug: string) => {
  return `
  query {
    article(slug: "${slug}", username: "") {
      ... on ArticleSuccess {
        article {
          id
          slug
          highlights {
            id
            shortId
            quote
            prefix
            suffix
            patch
            annotation
            sharedAt
            createdAt
          }
        }
      }
      ... on ArticleError {
        errorCodes
      }
    }
  }
  `
}

const searchQuery = (keyword = '') => {
  return `
  query {
    search(
      after: ""
      first: 5
      query: "${keyword}") {
      ... on SearchSuccess {
        edges {
          cursor
          node {
            id
            url
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
      ... on SearchError {
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

const saveFileQuery = (url: string, uploadFileId: string) => {
  return `
    mutation {
      saveFile (
        input: {
          url: "${url}",
          source: "test",
          clientRequestId: "${generateFakeUuid()}",
          uploadFileId: "${uploadFileId}",
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

const setBookmarkQuery = (articleId: string, bookmark: boolean) => {
  return `
    mutation {
      setBookmarkArticle(
        input: {
          articleID: "${articleId}",
          bookmark: ${bookmark}
        }
      ) {
        ... on SetBookmarkArticleSuccess {
          bookmarkedArticle {
            id
          }
        }
        ... on SetBookmarkArticleError {
          errorCodes
        }
      }
    }
    `
}

const saveArticleReadingProgressQuery = (
  articleId: string,
  progress: number
) => {
  return `
    mutation {
      saveArticleReadingProgress(
        input: {
          id: "${articleId}",
          readingProgressPercent: ${progress}
          readingProgressAnchorIndex: 0
        }
      ) {
        ... on SaveArticleReadingProgressSuccess {
          updatedArticle {
            id
            readingProgressPercent
          }
        }
        ... on SaveArticleReadingProgressError {
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
      before(() => {
        url = 'https://blog.omnivore.app/p/testing-is-fun-with-omnivore'
        source = 'puppeteer-parse'
        document = '<p>test</p>'
        title = 'new title'
      })

      after(async () => {
        await deletePage(pageId, ctx)
      })

      it('should create an article', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.createArticle.createdArticle.title).to.eql(title)
        pageId = res.body.data.createArticle.createdArticle.id
      })
    })
  })

  describe('GetArticle', () => {
    const realSlug = 'testing-is-really-fun-with-omnivore'

    let query = ''
    let slug = ''
    let pageId: string | undefined

    before(async () => {
      const page = {
        id: '',
        hash: 'test hash',
        userId: user.id,
        pageType: PageType.Article,
        title: 'test title',
        content: '<p>test</p>',
        slug: realSlug,
        createdAt: new Date(),
        updatedAt: new Date(),
        readingProgressPercent: 100,
        readingProgressAnchorIndex: 0,
        url: 'https://blog.omnivore.app/test-with-omnivore',
        savedAt: new Date(),
        highlights: [
          {
            id: 'test id',
            shortId: 'test short id',
            createdAt: new Date(),
            patch: 'test patch',
            quote: 'test quote',
          },
        ],
      } as Page
      pageId = await createPage(page, ctx)
    })

    after(async () => {
      if (pageId) {
        await deletePage(pageId, ctx)
      }
    })

    beforeEach(async () => {
      query = getArticleQuery(slug)
    })

    context('when page exists', () => {
      before(() => {
        slug = realSlug
      })

      it('should return the page', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.article.article.slug).to.eql(slug)
      })

      it('should return highlights', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.article.article.highlights).to.length(1)
      })
    })

    context('when page does not exist', () => {
      before(() => {
        slug = 'not-a-real-slug'
      })

      it('should return an error', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.article.errorCodes).to.eql(['NOT_FOUND'])
      })
    })
  })

  describe('GetArticles', () => {
    const url = 'https://blog.omnivore.app/p/getting-started-with-omnivore'

    let query = ''
    let after = ''
    let pages: Page[] = []
    let label: Label

    before(async () => {
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
          readingProgressPercent: 100,
          readingProgressAnchorIndex: 0,
          url: url,
          savedAt: new Date(),
        } as Page
        const pageId = await createPage(page, ctx)
        if (!pageId) {
          expect.fail('Failed to create page')
        }
        page.id = pageId
        pages.push(page)
      }
      //  create testing labels
      label = await createTestLabel(user, 'label', '#ffffff')
      //  set label to the last page
      await updatePage(
        pages[14].id,
        {
          labels: [{ id: label.id, name: label.name, color: label.color }],
        },
        ctx
      )
    })

    beforeEach(async () => {
      query = articlesQuery(after)
    })

    it('should return originalArticleUrl', async () => {
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.articles.edges[0].node.originalArticleUrl).to.eql(
        url
      )
    })

    context('when there are pages with labels', () => {
      before(() => {
        // get the last page
        after = '14'
      })

      it('should return labels', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.articles.edges[0].node.labels[0].id).to.eql(
          label.id
        )
      })
    })

    context('when we fetch the first page', () => {
      before(() => {
        after = ''
      })

      it('should return the first five items', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.articles.edges.length).to.eql(5)
        expect(res.body.data.articles.edges[0].node.id).to.eql(pages[0].id)
        expect(res.body.data.articles.edges[1].node.id).to.eql(pages[1].id)
        expect(res.body.data.articles.edges[2].node.id).to.eql(pages[2].id)
        expect(res.body.data.articles.edges[3].node.id).to.eql(pages[3].id)
        expect(res.body.data.articles.edges[4].node.id).to.eql(pages[4].id)
      })

      it('should set the pageInfo', async () => {
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

        let allLinks
        // Save a link, then archive it
        // set a slight delay to make sure the page is updated
        setTimeout(async () => {
          let allLinks = await graphqlRequest(
            articlesQuery('', 'DESCENDING'),
            authToken
          ).expect(200)
          const justSavedId = allLinks.body.data.articles.edges[0].node.id
          await archiveLink(authToken, justSavedId)
        }, 100)

        // test the negative case, ensuring the archive link wasn't returned
        setTimeout(async () => {
          allLinks = await graphqlRequest(
            articlesQuery('', 'DESCENDING'),
            authToken
          ).expect(200)
          expect(allLinks.body.data.articles.edges[0].node.url).to.not.eq(url)
        }, 100)

        // Now save the link again, and ensure it is returned
        await graphqlRequest(
          savePageQuery(url, title, originalContent),
          authToken
        ).expect(200)

        setTimeout(async () => {
          allLinks = await graphqlRequest(
            articlesQuery('', 'DESCENDING'),
            authToken
          ).expect(200)
          expect(allLinks.body.data.articles.edges[0].node.url).to.eq(url)
        }, 100)
      })
    })
  })

  describe('setBookmarkArticle', () => {
    let query = ''
    let articleId = ''
    let bookmark = true
    let pageId = ''

    before(async () => {
      const page: Page = {
        id: '',
        hash: 'test hash',
        userId: user.id,
        pageType: PageType.Article,
        title: 'test title',
        content: '<p>test</p>',
        createdAt: new Date(),
        url: 'https://blog.omnivore.app/setBookmarkArticle',
        slug: 'test-with-omnivore',
        readingProgressPercent: 0,
        readingProgressAnchorIndex: 0,
      }
      const newPageId = await createPage(page, ctx)
      if (newPageId) {
        pageId = newPageId
      }
    })

    after(async () => {
      if (pageId) {
        await deletePage(pageId, ctx)
      }
    })

    beforeEach(() => {
      query = setBookmarkQuery(articleId, bookmark)
    })

    context('when we set a bookmark on an article', () => {
      before(async () => {
        articleId = pageId
        bookmark = true
      })

      it('should bookmark an article', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.setBookmarkArticle.bookmarkedArticle.id).to.eq(
          articleId
        )
      })
    })

    context('when we unset a bookmark on an article', () => {
      before(async () => {
        articleId = pageId
        bookmark = false
      })

      it('should delete an article', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const pageId = await getPageById(articleId)
        expect(pageId).to.undefined
      })
    })
  })

  describe('saveArticleReadingProgressResolver', () => {
    let query = ''
    let articleId = ''
    let progress = 0.5
    let pageId = ''

    before(async () => {
      pageId = (await createTestElasticPage(user)).id
    })

    after(async () => {
      if (pageId) {
        await deletePage(pageId, ctx)
      }
    })

    beforeEach(() => {
      query = saveArticleReadingProgressQuery(articleId, progress)
    })

    context('when we save a reading progress on an article', () => {
      before(async () => {
        articleId = pageId
        progress = 0.5
      })

      it('should save a reading progress on an article', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(
          res.body.data.saveArticleReadingProgress.updatedArticle
            .readingProgressPercent
        ).to.eq(progress)
      })

      it('should not allow setting the reading progress lower than current progress', async () => {
        const firstQuery = saveArticleReadingProgressQuery(articleId, 75)
        const firstRes = await graphqlRequest(firstQuery, authToken).expect(200)
        expect(
          firstRes.body.data.saveArticleReadingProgress.updatedArticle
            .readingProgressPercent
        ).to.eq(75)

        // Now try to set to a lower value (50), value should not be updated
        // have a slight delay to ensure the reading progress is updated
        setTimeout(async () => {
          const secondQuery = saveArticleReadingProgressQuery(articleId, 50)
          const secondRes = await graphqlRequest(secondQuery, authToken).expect(
            200
          )
          expect(
            secondRes.body.data.saveArticleReadingProgress.updatedArticle
              .readingProgressPercent
          ).to.eq(75)
        }, 100)
      })
    })
  })

  describe('SaveFile', () => {
    let query = ''
    let url = ''
    let uploadFileId = ''

    beforeEach(() => {
      query = saveFileQuery(url, uploadFileId)
    })

    context('when the file is not uploaded', () => {
      before(async () => {
        url = 'fake url'
        uploadFileId = generateFakeUuid()
      })

      it('should return Unauthorized error', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.saveFile.errorCodes).to.eql(['UNAUTHORIZED'])
      })
    })

    context('when the file is uploaded', () => {
      before(async () => {
        url = 'https://example.com/'
        const uploadFile = await getRepository(UploadFile).save({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          url: url,
          user: user,
          status: UploadFileStatus.Initialized,
        })
        uploadFileId = uploadFile.id
      })

      it('should return the new url', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.saveFile.url).to.startsWith(
          'http://localhost:3000/fakeUser/links'
        )
      })
    })
  })

  describe('Search API', () => {
    const url = 'https://blog.omnivore.app/p/getting-started-with-omnivore'
    const pages: Page[] = []
    const highlights: Highlight[] = []

    let query = ''
    let keyword = ''

    before(async () => {
      // Create some test pages
      for (let i = 0; i < 5; i++) {
        const page: Page = {
          id: '',
          hash: 'test hash',
          userId: user.id,
          pageType: PageType.Article,
          title: 'test title',
          content: '<p>search page</p>',
          slug: 'test slug',
          createdAt: new Date(),
          updatedAt: new Date(),
          readingProgressPercent: 0,
          readingProgressAnchorIndex: 0,
          url: url,
          savedAt: new Date(),
        }
        const pageId = await createPage(page, ctx)
        if (!pageId) {
          expect.fail('Failed to create page')
        }
        page.id = pageId
        pages.push(page)

        // Create some test highlights
        const highlight: Highlight = {
          id: `highlight-${i}`,
          patch: 'test patch',
          shortId: 'test shortId',
          userId: user.id,
          quote: '<p>search highlight</p>',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await addHighlightToPage(pageId, highlight, ctx)
        highlights.push(highlight)
      }
    })

    beforeEach(async () => {
      query = searchQuery(keyword)
    })

    context('when type:highlights is not in the query', () => {
      before(() => {
        keyword = 'search'
      })

      it('should return pages in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges.length).to.eql(5)
        expect(res.body.data.search.edges[0].node.id).to.eq(pages[4].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(pages[3].id)
        expect(res.body.data.search.edges[2].node.id).to.eq(pages[2].id)
        expect(res.body.data.search.edges[3].node.id).to.eq(pages[1].id)
        expect(res.body.data.search.edges[4].node.id).to.eq(pages[0].id)
      })
    })

    context('when type:highlights is in the query', () => {
      before(() => {
        keyword = 'search type:highlights'
      })

      it('should return highlights in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges.length).to.eq(5)
        expect(res.body.data.search.edges[0].node.id).to.eq(highlights[4].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(highlights[3].id)
        expect(res.body.data.search.edges[2].node.id).to.eq(highlights[2].id)
        expect(res.body.data.search.edges[3].node.id).to.eq(highlights[1].id)
        expect(res.body.data.search.edges[4].node.id).to.eq(highlights[0].id)
      })
    })
  })
})
