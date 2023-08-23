import 'mocha'
import { expect } from 'chai'
import { InFilter, ReadFilter } from '../../src/utils/search'
import {
  ArticleSavingRequestStatus,
  Page,
  PageContext,
  PageType,
} from '../../src/elastic/types'
import { createPubSubClient } from '../../src/pubsub'
import {
  countByCreatedAt,
  createPage,
  deletePage,
  deletePagesByParam,
  getPageById,
  getPageByParam,
  searchAsYouType,
  searchPages,
  updatePage,
} from '../../src/elastic/pages'
import { createTestElasticPage } from '../util'

describe('pages in elastic', () => {
  const userId = 'userId'
  const ctx: PageContext = {
    pubsub: createPubSubClient(),
    refresh: true,
    uid: userId,
  }

  describe('createPage', () => {
    let newPageId: string

    after(async () => {
      await deletePage(newPageId, ctx)
    })

    it('creates a page', async () => {
      const newPageData: Page = {
        id: '',
        hash: 'hash',
        userId: 'userId',
        pageType: PageType.Article,
        title: 'test',
        content: 'test',
        slug: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        savedAt: new Date(),
        readingProgressPercent: 0,
        readingProgressAnchorIndex: 0,
        url: 'https://blog.omnivore.app/testUrl',
        state: ArticleSavingRequestStatus.Succeeded,
      }
      newPageId = (await createPage(newPageData, ctx))!
      expect(newPageId).to.be.a('string')
    })
  })

  describe('getPageByParam', () => {
    let page: Page

    before(async () => {
      // create a testing page
      page = await createTestElasticPage(userId)
    })

    after(async () => {
      // delete the testing page
      await deletePage(page.id, ctx)
    })

    it('gets a page by url', async () => {
      const pageFound = await getPageByParam({
        userId: page.userId,
        url: page.url,
      })

      expect(pageFound).not.undefined
    })
  })

  describe('getPageById', () => {
    let page: Page

    before(async () => {
      // create a testing page
      page = await createTestElasticPage(userId)
    })

    after(async () => {
      // delete the testing page
      await deletePage(page.id, ctx)
    })

    it('gets a page by id', async () => {
      const pageFound = await getPageById(page.id)
      expect(pageFound).not.undefined
    })
  })

  describe('updatePage', () => {
    let page: Page

    before(async () => {
      // create a testing page
      page = await createTestElasticPage(userId)
    })

    after(async () => {
      // delete the testing page
      await deletePage(page.id, ctx)
    })

    it('updates a page', async () => {
      const newTitle = 'new title'
      const updatedPageData: Partial<Page> = {
        title: newTitle,
      }

      await updatePage(page.id, updatedPageData, ctx)

      const updatedPage = await getPageById(page.id)
      expect(updatedPage?.title).to.eql(newTitle)
    })
  })

  describe('searchPages', () => {
    let page: Page

    before(async () => {
      // create a testing page
      page = await createTestElasticPage(userId)
    })

    after(async () => {
      // delete the testing page
      await deletePage(page.id, ctx)
    })

    it('searches pages', async () => {
      const searchResults = await searchPages(
        {
          dateFilters: [],
          hasFilters: [],
          inFilter: InFilter.ALL,
          labelFilters: [],
          readFilter: ReadFilter.ALL,
          query: page.content,
        },
        page.userId
      )
      expect(searchResults).not.undefined
    })
  })

  describe('countByCreatedAt', () => {
    const createdAt = Date.now() - 60 * 60 * 24 * 1000
    let page: Page

    before(async () => {
      page = {
        id: '',
        hash: 'hash',
        userId: userId,
        pageType: PageType.Article,
        title: 'test',
        content: 'test',
        slug: 'test',
        createdAt: new Date(createdAt),
        savedAt: new Date(),
        readingProgressPercent: 0,
        readingProgressAnchorIndex: 0,
        url: 'https://blog.omnivore.app/testCount',
        state: ArticleSavingRequestStatus.Succeeded,
      }

      page.id = (await createPage(page, ctx))!
    })

    after(async () => {
      await deletePage(page.id, ctx)
    })

    it('counts pages by createdAt', async () => {
      const count = await countByCreatedAt(userId, createdAt, createdAt)
      expect(count).to.eq(1)
    })
  })

  describe('deletePagesByParam', () => {
    const userId = 'test user id'

    before(async () => {
      // create a testing page
      await createPage(
        {
          content: 'deletePagesByParam content',
          createdAt: new Date(),
          hash: '',
          id: '',
          pageType: PageType.Article,
          readingProgressAnchorIndex: 0,
          readingProgressPercent: 0,
          savedAt: new Date(),
          slug: 'deletePagesByParam slug',
          state: ArticleSavingRequestStatus.Succeeded,
          title: 'deletePagesByParam title',
          url: 'https://localhost/deletePagesByParam',
          userId,
        },
        ctx
      )
    })

    it('deletes page by userId', async () => {
      const deleted = await deletePagesByParam(
        {
          userId,
        },
        ctx
      )

      expect(deleted).to.be.true
    })
  })

  describe('searchAsYouType', () => {
    let pageId: string

    before(async () => {
      // create a testing page
      pageId = (await createPage(
        {
          content: '',
          createdAt: new Date(),
          hash: '',
          id: '',
          pageType: PageType.Article,
          readingProgressAnchorIndex: 0,
          readingProgressPercent: 0,
          savedAt: new Date(),
          slug: '',
          state: ArticleSavingRequestStatus.Succeeded,
          title: 'search as you type',
          url: '',
          userId,
        },
        ctx
      ))!
    })

    after(async () => {
      // delete the testing page
      await deletePage(pageId, ctx)
    })

    it('searches pages', async () => {
      const searchResults = await searchAsYouType(userId, 'search')
      expect(searchResults).not.empty
    })
  })
})
