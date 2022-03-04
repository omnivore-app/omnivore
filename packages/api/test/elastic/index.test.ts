import 'mocha'
import {
  createPage,
  deletePage,
  getPageById,
  getPageByUrl,
  Page,
  searchPages,
  updatePage,
} from '../../src/elastic'
import { PageType } from '../../src/generated/graphql'
import { expect } from 'chai'
import { InFilter, ReadFilter } from '../../src/utils/search'

describe('elastic api', () => {
  let page: Page

  before(async () => {
    // create a testing page
    page = {
      hash: 'test hash',
      userId: 'test userId',
      pageType: PageType.Article,
      title: 'test title',
      content: '<p>test</p>',
      slug: 'test slug',
      createdAt: new Date(),
      updatedAt: new Date(),
      readingProgress: 100,
      readingProgressAnchorIndex: 0,
      url: 'https://blog.omnivore.app/p/getting-started-with-omnivore',
      archivedAt: new Date(),
      labels: [
        {
          id: 'Test label id',
          name: 'test label',
          color: '#ffffff',
          createdAt: new Date(),
        },
        {
          id: 'Test label id 2',
          name: 'test label 2',
          color: '#eeeeee',
          createdAt: new Date(),
        },
      ],
    }
    page.id = await createPage(page)
  })

  after(async () => {
    if (!page.id) {
      expect.fail('pageId is null')
    }
    // delete the testing page
    await deletePage(page.id)
  })

  describe('createPage', () => {
    let newPageId: string | undefined

    after(async () => {
      if (!newPageId) {
        expect.fail('pageId is null')
      }
      await deletePage(newPageId)
    })

    it('creates a page', async () => {
      const newPageData: Page = {
        hash: 'hash',
        userId: 'userId',
        pageType: PageType.Article,
        title: 'test',
        content: 'test',
        slug: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        readingProgress: 0,
        readingProgressAnchorIndex: 0,
      }

      newPageId = await createPage(newPageData)

      expect(newPageId).to.be.a('string')
    })
  })

  describe('getPageByUrl', () => {
    it('gets a page by url', async () => {
      const url = page.url || 'url'

      const pageFound = await getPageByUrl(page.userId, url)

      expect(pageFound).not.undefined
    })
  })

  describe('getPageById', () => {
    it('gets a page by id', async () => {
      if (!page.id) {
        expect.fail('page id is undefined')
      }
      const pageFound = await getPageById(page.id)

      expect(pageFound).not.undefined
    })
  })

  describe('updatePage', () => {
    it('updates a page', async () => {
      const newTitle = 'new title'
      const updatedPageData: Page = {
        ...page,
        title: newTitle,
      }

      if (page.id) {
        await updatePage(page.id, updatedPageData)
        const updatedPage = await getPageById(page.id)
        expect(updatedPage?.title).to.eql(newTitle)
      } else {
        expect.fail('page id is undefined')
      }
    })
  })

  describe('searchPages', () => {
    it('searches pages', async () => {
      const searchResults = await searchPages(
        {
          inFilter: InFilter.ALL,
          labelFilters: [],
          readFilter: ReadFilter.ALL,
          query: 'test',
        },
        page.userId
      )
      expect(searchResults).not.undefined
    })
  })
})
