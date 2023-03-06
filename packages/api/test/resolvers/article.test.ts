import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import 'mocha'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import { refreshIndex } from '../../src/elastic'
import { addHighlightToPage } from '../../src/elastic/highlights'
import {
  createPage,
  deletePage,
  deletePagesByParam,
  getPageById,
  getPageByParam,
  updatePage,
} from '../../src/elastic/pages'
import {
  ArticleSavingRequestStatus,
  Highlight,
  HighlightType,
  Page,
  PageContext,
  PageType,
} from '../../src/elastic/types'
import { UploadFile } from '../../src/entity/upload_file'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/entity/utils'
import {
  BulkActionType,
  SyncUpdatedItemEdge,
  UpdateReason,
  UploadFileStatus,
} from '../../src/generated/graphql'
import { createTestUser, deleteTestUser } from '../db'
import {
  createTestElasticPage,
  generateFakeUuid,
  graphqlRequest,
  request,
} from '../util'
import sinon from 'sinon'
import * as createTask from '../../src/utils/createTask'
import * as uploads from '../../src/utils/uploads'

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
          isArchived
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

const articlesQuery = (after = '') => {
  return `
  query {
    articles(
      sharedOnly: ${false}
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
            createdAt
            updatedAt
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
          content
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
            updatedAt
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
            createdAt
            updatedAt
            highlights {
              id
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
      ... on SearchError {
        errorCodes
      }
    }
  }
  `
}

const savePageQuery = (
  url: string,
  title: string,
  originalContent: string,
  state: ArticleSavingRequestStatus | null = null,
  labels: string[] | null = null
) => {
  return `
    mutation {
      savePage(
        input: {
          url: "${url}",
          source: "test",
          clientRequestId: "${generateFakeUuid()}",
          title: "${title}",
          originalContent: "${originalContent}"
          state: ${state}
          labels: ${
            labels
              ? '[' + labels.map((label) => `{ name: "${label}" }`) + ']'
              : null
          }
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

const saveUrlQuery = (
  url: string,
  state: ArticleSavingRequestStatus | null = null,
  labels: string[] | null = null
) => {
  return `
    mutation {
      saveUrl(
        input: {
          url: "${url}",
          source: "test",
          clientRequestId: "${generateFakeUuid()}",
          state: ${state}
          labels: ${
            labels
              ? '[' + labels.map((label) => `{ name: "${label}" }`) + ']'
              : null
          }
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
  progress: number,
  topPercent: number | null = null
) => {
  return `
    mutation {
      saveArticleReadingProgress(
        input: {
          id: "${articleId}",
          readingProgressPercent: ${progress}
          readingProgressAnchorIndex: 0
          readingProgressTopPercent: ${topPercent}
        }
      ) {
        ... on SaveArticleReadingProgressSuccess {
          updatedArticle {
            id
            readingProgressPercent
            readAt
            readingProgressTopPercent
          }
        }
        ... on SaveArticleReadingProgressError {
          errorCodes
        }
      }
    }
    `
}

const typeaheadSearchQuery = (keyword: string) => {
  return `
  query {
    typeaheadSearch(query: "${keyword}") {
      ... on TypeaheadSearchSuccess {
        items {
          id
          slug
          title
        }
      }
      ... on TypeaheadSearchError {
        errorCodes
      }
    }
  }
  `
}

describe('Article API', () => {
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
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
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

    context('when saving an archived article', () => {
      before(async () => {
        url = 'https://blog.omnivore.app/saving-archived-article.com'
        source = 'puppeteer-parse'
        document = '<p>test</p>'
        title = 'new title'

        pageId = (await createPage(
          {
            content: document,
            createdAt: new Date(),
            hash: 'test hash',
            id: '',
            pageType: PageType.Article,
            readingProgressAnchorIndex: 0,
            readingProgressPercent: 0,
            savedAt: new Date(),
            slug: 'test saving an archived article slug',
            state: ArticleSavingRequestStatus.Succeeded,
            title,
            userId: user.id,
            url,
            archivedAt: new Date(),
          },
          ctx
        ))!
      })

      after(async () => {
        await deletePage(pageId, ctx)
      })

      it('unarchives the article', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.createArticle.createdArticle.isArchived).to.false
      })
    })
  })

  describe('GetArticle', () => {
    const realSlug = 'testing-is-really-fun-with-omnivore'

    let query = ''
    let slug = ''
    let pageId: string

    before(async () => {
      const page: Page = {
        state: ArticleSavingRequestStatus.Succeeded,
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
            updatedAt: new Date(),
            userId: user.id,
            type: HighlightType.Highlight,
          },
        ],
      }
      pageId = (await createPage(page, ctx))!
    })

    after(async () => {
      await deletePage(pageId, ctx)
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

      context('when page is failed to process', () => {
        before(async () => {
          await updatePage(
            pageId,
            {
              state: ArticleSavingRequestStatus.Processing,
              savedAt: new Date(Date.now() - 1000 * 60),
            },
            ctx
          )
        })

        it('should return unable to parse', async () => {
          const res = await graphqlRequest(query, authToken).expect(200)

          expect(res.body.data.article.article.content).to.eql(
            '<p>We were unable to parse this page.</p>'
          )
        })
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

  describe('SavePage', () => {
    let query = ''
    let title = 'Example Title'
    let url = 'https://blog.omnivore.app'
    let originalContent = '<div>Example Content</div>'

    beforeEach(() => {
      query = savePageQuery(url, title, originalContent)
    })

    context('when we save a new page', () => {
      after(async () => {
        await deletePagesByParam({ url }, ctx)
      })

      it('should return a slugged url', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.savePage.url).to.startsWith(
          'http://localhost:3000/fakeUser/example-title-'
        )
      })
    })

    context('when we save a page that is already archived', () => {
      before(() => {
        url = 'https://blog.omnivore.app/new-url'
      })

      after(async () => {
        await deletePagesByParam({ url }, ctx)
      })

      it('it should return that page in the GetArticles Query', async () => {
        await graphqlRequest(
          savePageQuery(url, title, originalContent),
          authToken
        ).expect(200)
        await refreshIndex()

        // Save a link, then archive it
        // refresh the index to make sure the page is updated
        let allLinks = await graphqlRequest(
          articlesQuery(''),
          authToken
        ).expect(200)
        const justSavedId = allLinks.body.data.articles.edges[0].node.id
        await archiveLink(authToken, justSavedId)
        await refreshIndex()

        // test the negative case, ensuring the archive link wasn't returned
        allLinks = await graphqlRequest(articlesQuery(''), authToken).expect(
          200
        )
        expect(allLinks.body.data.articles.edges[0]?.node?.url).to.not.eq(url)

        // Now save the link again, and ensure it is returned
        await graphqlRequest(
          savePageQuery(url, title, originalContent),
          authToken
        ).expect(200)
        await refreshIndex()

        allLinks = await graphqlRequest(articlesQuery(''), authToken).expect(
          200
        )
        expect(allLinks.body.data.articles.edges[0].node.url).to.eq(url)
      })
    })

    context('when we also want to save labels and archives the page', () => {
      after(async () => {
        await deletePagesByParam({ url }, ctx)
      })

      it('saves the labels and archives the page', async () => {
        url = 'https://blog.omnivore.app/new-url-2'
        const state = ArticleSavingRequestStatus.Archived
        const labels = ['test name', 'test name 2']
        await graphqlRequest(
          savePageQuery(url, title, originalContent, state, labels),
          authToken
        ).expect(200)
        await refreshIndex()

        const savedPage = await getPageByParam({ url })
        expect(savedPage?.archivedAt).to.not.be.null
        expect(savedPage?.labels?.map((l) => l.name)).to.eql(labels)
      })
    })
  })

  describe('SaveUrl', () => {
    let query = ''
    let url = 'https://blog.omnivore.app/new-url-1'

    before(() => {
      sinon.replace(createTask, 'enqueueParseRequest', sinon.fake.resolves(''))
    })

    beforeEach(() => {
      query = saveUrlQuery(url)
    })

    after(() => {
      sinon.restore()
    })

    afterEach(async () => {
      await deletePagesByParam({ url }, ctx)
    })

    context('when we save a new url', () => {
      it('should return a slugged url', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.saveUrl.url).to.startsWith(
          'http://localhost:3000/fakeUser/links/'
        )
      })
    })

    context('when we save labels', () => {
      it('saves the labels and archives the page', async () => {
        url = 'https://blog.omnivore.app/new-url-2'
        const state = ArticleSavingRequestStatus.Archived
        const labels = ['test name', 'test name 2']
        await graphqlRequest(
          saveUrlQuery(url, state, labels),
          authToken
        ).expect(200)
        await refreshIndex()

        const savedPage = await getPageByParam({ url })
        expect(savedPage?.archivedAt).to.not.be.null
        expect(savedPage?.labels?.map((l) => l.name)).to.eql(labels)
      })
    })
  })

  describe('setBookmarkArticle', () => {
    let query = ''
    let articleId = ''
    let bookmark = true
    let pageId: string

    before(async () => {
      const page: Page = {
        id: '',
        hash: 'test hash',
        userId: user.id,
        pageType: PageType.Article,
        title: 'test title',
        content: '<p>test</p>',
        createdAt: new Date(),
        savedAt: new Date(),
        url: 'https://blog.omnivore.app/setBookmarkArticle',
        slug: 'test-with-omnivore',
        readingProgressPercent: 0,
        readingProgressAnchorIndex: 0,
        state: ArticleSavingRequestStatus.Succeeded,
      }
      pageId = (await createPage(page, ctx))!
    })

    after(async () => {
      await deletePage(pageId, ctx)
    })

    beforeEach(() => {
      query = setBookmarkQuery(articleId, bookmark)
    })

    context('when we set a bookmark on an article', () => {
      before(() => {
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
      before(() => {
        articleId = pageId
        bookmark = false
      })

      it('should delete an article', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const page = await getPageById(articleId)
        expect(page?.state).to.eql(ArticleSavingRequestStatus.Deleted)
        expect(page?.highlights).to.eql([])
      })
    })
  })

  describe('saveArticleReadingProgressResolver', () => {
    let query = ''
    let pageId = ''
    let progress = 0.5
    let topPercent: number | null = null

    before(async () => {
      pageId = (await createTestElasticPage(user.id)).id!
    })

    after(async () => {
      await deletePage(pageId, ctx)
    })

    it('saves a reading progress on an article', async () => {
      query = saveArticleReadingProgressQuery(pageId, progress, topPercent)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(
        res.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressPercent
      ).to.eq(progress)
      expect(res.body.data.saveArticleReadingProgress.updatedArticle.readAt).not
        .null
    })

    it('should not allow setting the reading progress lower than current progress', async () => {
      const firstQuery = saveArticleReadingProgressQuery(pageId, 75)
      const firstRes = await graphqlRequest(firstQuery, authToken).expect(200)
      expect(
        firstRes.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressPercent
      ).to.eq(75)
      await refreshIndex()

      // Now try to set to a lower value (50), value should not be updated
      // refresh index to ensure the reading progress is updated
      const secondQuery = saveArticleReadingProgressQuery(pageId, 50)
      const secondRes = await graphqlRequest(secondQuery, authToken).expect(200)
      expect(
        secondRes.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressPercent
      ).to.eq(75)
    })

    it('does not save topPercent if not undefined', async () => {
      query = saveArticleReadingProgressQuery(pageId, progress, null)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(
        res.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressTopPercent
      ).to.be.null
    })

    it('saves topPercent if defined', async () => {
      const topPercent = 0.2
      query = saveArticleReadingProgressQuery(pageId, progress, topPercent)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(
        res.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressTopPercent
      ).to.eql(topPercent)
    })

    it('saves topPercent as 0 if defined as 0', async () => {
      const topPercent = 0
      query = saveArticleReadingProgressQuery(pageId, progress, topPercent)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(
        res.body.data.saveArticleReadingProgress.updatedArticle
          .readingProgressTopPercent
      ).to.eql(topPercent)
    })

    it('returns BAD_DATA error if top position is greater than bottom position', async () => {
      query = saveArticleReadingProgressQuery(pageId, 0.5, 0.8)
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.saveArticleReadingProgress.errorCodes).to.eql([
        'BAD_DATA',
      ])
    })
  })

  describe('SaveFile', () => {
    let query = ''
    let url = ''
    let uploadFileId = ''

    before(() => {
      sinon.replace(
        uploads,
        'getStorageFileDetails',
        sinon.fake.resolves({ fileUrl: 'fake url', md5Hash: 'fake hash' })
      )
    })

    beforeEach(() => {
      query = saveFileQuery(url, uploadFileId)
    })

    after(() => {
      sinon.restore()
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
        url = 'https://blog.omnivore.app/'
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
          content: '<p>test search api</p>',
          slug: 'test slug',
          createdAt: new Date(),
          updatedAt: new Date(),
          readingProgressPercent: 0,
          readingProgressAnchorIndex: 0,
          url: url,
          savedAt: new Date(),
          state: ArticleSavingRequestStatus.Succeeded,
          siteName: 'Example',
        }
        page.id = (await createPage(page, ctx))!
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
          type: HighlightType.Highlight,
        }
        await addHighlightToPage(page.id, highlight, ctx)
        highlights.push(highlight)
      }
    })

    beforeEach(async () => {
      query = searchQuery(keyword)
    })

    after(async () => {
      await deletePagesByParam({ userId: user.id }, ctx)
    })

    context('when type:highlights is not in the query', () => {
      before(() => {
        keyword = 'search api'
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

      it('should return highlights in pages', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges[0].node.highlights.length).to.eql(1)
        expect(res.body.data.search.edges[0].node.highlights[0].id).to.eq(
          highlights[4].id
        )
      })
    })

    context('when type:highlights is in the query', () => {
      before(() => {
        keyword = "'search api' type:highlights"
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

    context('when is:unread is in the query', () => {
      before(() => {
        keyword = "'search api' is:unread"
      })

      it('should return unread articles in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.edges.length).to.eq(5)
        expect(res.body.data.search.edges[0].node.id).to.eq(pages[4].id)
        expect(res.body.data.search.edges[1].node.id).to.eq(pages[3].id)
        expect(res.body.data.search.edges[2].node.id).to.eq(pages[2].id)
        expect(res.body.data.search.edges[3].node.id).to.eq(pages[1].id)
        expect(res.body.data.search.edges[4].node.id).to.eq(pages[0].id)
      })
    })

    context('when no:label is in the query', () => {
      before(async () => {
        keyword = "'search api' no:label"
      })

      it('returns non-labeled items in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(5)
      })
    })

    context('when no:highlight is in the query', () => {
      before(async () => {
        keyword = "'search api' no:highlight"
      })

      it('returns non-highlighted items in descending order', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(0)
      })
    })

    context('when site:${site_name} is in the query', () => {
      before(async () => {
        keyword = "'search api' site:example"
      })

      it('returns items from the site', async () => {
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.search.pageInfo.totalCount).to.eq(5)
      })
    })
  })

  describe('TypeaheadSearch API', () => {
    const pages: Page[] = []

    let query = ''
    let keyword = 'typeahead'

    before(async () => {
      // Create some test pages
      for (let i = 0; i < 5; i++) {
        const page: Page = {
          id: '',
          hash: '',
          userId: user.id,
          pageType: PageType.Article,
          title: 'typeahead search page',
          content: '',
          slug: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          readingProgressPercent: 0,
          readingProgressAnchorIndex: 0,
          url: '',
          savedAt: new Date(),
          state: ArticleSavingRequestStatus.Succeeded,
        }
        page.id = (await createPage(page, ctx))!
        pages.push(page)
      }
    })

    beforeEach(async () => {
      query = typeaheadSearchQuery(keyword)
    })

    after(async () => {
      await deletePagesByParam({ userId: user.id }, ctx)
    })

    it('should return pages with typeahead prefix', async () => {
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.typeaheadSearch.items.length).to.eql(5)
      expect(res.body.data.typeaheadSearch.items[0].id).to.eq(pages[0].id)
      expect(res.body.data.typeaheadSearch.items[1].id).to.eq(pages[1].id)
      expect(res.body.data.typeaheadSearch.items[2].id).to.eq(pages[2].id)
      expect(res.body.data.typeaheadSearch.items[3].id).to.eq(pages[3].id)
      expect(res.body.data.typeaheadSearch.items[4].id).to.eq(pages[4].id)
    })
  })

  describe('UpdatesSince API', () => {
    const updatesSinceQuery = (since: string) => `
      query {
        updatesSince(
          since: "${since}") {
          ... on UpdatesSinceSuccess {
            edges {
              cursor
              node {
                id
                createdAt
                updatedAt
                pageType
              }
              itemID
              updateReason
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
              totalCount
            }
          }
          ... on UpdatesSinceError {
            errorCodes
          }
        }
      }
    `
    let since: string
    let pages: Page[] = []
    let deletedPages: Page[] = []

    before(async () => {
      // Create some test pages
      for (let i = 0; i < 5; i++) {
        const page: Page = {
          id: '',
          hash: '',
          userId: user.id,
          pageType: PageType.Article,
          title: 'test page',
          content: '',
          slug: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          readingProgressPercent: 0,
          readingProgressAnchorIndex: 0,
          url: '',
          savedAt: new Date(),
          state: ArticleSavingRequestStatus.Succeeded,
        }
        page.id = (await createPage(page, ctx))!
        pages.push(page)
      }

      // set the since to be the timestamp before deletion
      since = pages[4].updatedAt!.toISOString()

      // Delete some pages
      for (let i = 0; i < 3; i++) {
        await updatePage(
          pages[i].id,
          { state: ArticleSavingRequestStatus.Deleted },
          ctx
        )
        deletedPages.push(pages[i])
      }
    })

    after(async () => {
      // Delete all pages
      await deletePagesByParam({ userId: user.id }, ctx)
    })

    it('returns pages deleted after since', async () => {
      const res = await graphqlRequest(
        updatesSinceQuery(since),
        authToken
      ).expect(200)

      expect(
        res.body.data.updatesSince.edges.filter(
          (e: SyncUpdatedItemEdge) => e.updateReason === UpdateReason.Deleted
        ).length
      ).to.eql(3)
      expect(res.body.data.updatesSince.edges[0].itemID).to.eq(
        deletedPages[2].id
      )
      expect(res.body.data.updatesSince.edges[1].itemID).to.eq(
        deletedPages[1].id
      )
      expect(res.body.data.updatesSince.edges[2].itemID).to.eq(
        deletedPages[0].id
      )
      expect(res.body.data.updatesSince.edges[0].updateReason).to.eq(
        UpdateReason.Deleted
      )
    })
  })

  describe('BulkAction API', () => {
    const bulkActionQuery = (action: BulkActionType) => `
      mutation {
        bulkAction (action: ${action}) {
          ... on BulkActionSuccess {
            success
          }
          ... on BulkActionError {
            errorCodes
          }
        }
      }
    `

    before(async () => {
      // Create some test pages
      for (let i = 0; i < 5; i++) {
        await createPage(
          {
            id: '',
            hash: '',
            userId: user.id,
            pageType: i == 0 ? PageType.Article : PageType.File,
            title: 'test page',
            content: '',
            slug: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            readingProgressPercent: 0,
            readingProgressAnchorIndex: 0,
            url: '',
            savedAt: new Date(),
            state:
              i == 0
                ? ArticleSavingRequestStatus.Failed
                : ArticleSavingRequestStatus.Succeeded,
          },
          ctx
        )
      }
    })

    after(async () => {
      // Delete all pages
      await deletePagesByParam({ userId: user.id }, ctx)
    })

    context('when action is Archive', () => {
      it('archives all pages', async () => {
        const res = await graphqlRequest(
          bulkActionQuery(BulkActionType.Archive),
          authToken
        ).expect(200)
        expect(res.body.data.bulkAction.success).to.be.true
        // Wait for the archive to finish
        await setTimeout(async () => {
          const pages = await graphqlRequest(searchQuery(), authToken).expect(
            200
          )
          expect(pages.body.data.search.pageInfo.totalCount).to.eql(0)
        }, 1000)
      })
    })

    context('when action is Delete', () => {
      it('deletes all pages', async () => {
        const res = await graphqlRequest(
          bulkActionQuery(BulkActionType.Delete),
          authToken
        ).expect(200)
        expect(res.body.data.bulkAction.success).to.be.true
        // Wait for the delete to finish
        await setTimeout(async () => {
          const pages = await graphqlRequest(
            searchQuery('in:all'),
            authToken
          ).expect(200)
          expect(pages.body.data.search.pageInfo.totalCount).to.eql(0)
        }, 1000)
      })
    })
  })
})
