import 'mocha'
import {
  createPage,
  getPageById,
  getPageByUrl,
  Page,
  updatePage,
} from '../../src/elastic'
import { PageType } from '../../src/generated/graphql'
import { expect } from 'chai'

describe('elastic api', () => {
  let page: Page

  before(async () => {
    // create a testing page
    page = {
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
      url: 'url',
    }
    page.id = await createPage(page)
  })

  describe('createPage', () => {
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

      const pageId = await createPage(newPageData)

      expect(pageId).to.be.a('string')
    })
  })

  describe('getPageByUrl', () => {
    it('gets a page by url', async () => {
      const url = page.url || 'url'

      const pageFound = await getPageByUrl(url)

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
})
