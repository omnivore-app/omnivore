import 'mocha'
import {
  createPage,
  deletePage,
  getPageById,
  getPageByParam,
  searchPages,
  updatePage,
} from '../../src/elastic'
import { PageType } from '../../src/generated/graphql'
import { expect } from 'chai'
import { InFilter, ReadFilter } from '../../src/utils/search'
import { Page } from '../../src/elastic/types'

describe('elastic api', () => {
  let page: Page

  before(async () => {
    // create a testing page
    page = {
      id: '',
      hash: 'test hash',
      userId: 'test userId',
      pageType: PageType.Article,
      title: 'test title',
      content: '<p>test</p>',
      slug: 'test slug',
      createdAt: new Date(),
      updatedAt: new Date(),
      readingProgressPercent: 100,
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
    const pageId = await createPage(page)
    if (!pageId) {
      expect.fail('Failed to create page')
    }
    page.id = pageId
  })

  after(async () => {
    // delete the testing page
    await deletePage(page.id)
  })

  describe('createPage', () => {
    let newPageId: string | undefined

    after(async () => {
      if (newPageId) {
        await deletePage(newPageId)
      }
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
        readingProgressPercent: 0,
        readingProgressAnchorIndex: 0,
        url: 'https://blog.omnivore.app/testUrl',
      }

      newPageId = await createPage(newPageData)

      expect(newPageId).to.be.a('string')
    })
  })

  describe('getPageByParam', () => {
    it('gets a page by url', async () => {
      const pageFound = await getPageByParam({
        userId: page.userId,
        url: page.url,
      })

      expect(pageFound).not.undefined
    })
  })

  describe('getPageById', () => {
    it('gets a page by id', async () => {
      const pageFound = await getPageById(page.id)

      expect(pageFound).not.undefined
    })
  })

  describe('updatePage', () => {
    it('updates a page', async () => {
      const newTitle = 'new title'
      const updatedPageData: Partial<Page> = {
        title: newTitle,
      }

      await updatePage(page.id, updatedPageData)

      const updatedPage = await getPageById(page.id)

      expect(updatedPage?.title).to.eql(newTitle)
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
