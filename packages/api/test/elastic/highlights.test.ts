import 'mocha'
import { expect } from 'chai'
import {
  Highlight,
  HighlightType,
  Page,
  PageContext,
} from '../../src/elastic/types'
import { createPubSubClient } from '../../src/pubsub'
import { deletePage } from '../../src/elastic/pages'
import {
  addHighlightToPage,
  searchHighlights,
} from '../../src/elastic/highlights'
import { createTestElasticPage } from '../util'

describe('highlights in elastic', () => {
  const userId = 'userId'
  const ctx: PageContext = {
    pubsub: createPubSubClient(),
    refresh: true,
    uid: userId,
  }

  describe('searchHighlights', () => {
    const highlightId = 'highlightId'
    let page: Page

    before(async () => {
      // create a testing page
      page = await createTestElasticPage(userId)
      const highlightData: Highlight = {
        patch: 'test patch',
        quote: 'test content',
        shortId: 'test shortId',
        id: highlightId,
        userId: page.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: HighlightType.Highlight,
      }

      await addHighlightToPage(page.id, highlightData, ctx)
    })

    after(async () => {
      // delete the testing page
      await deletePage(page.id, ctx)
    })

    it('searches highlights', async () => {
      const [searchResults, count] = (await searchHighlights(
        {
          query: 'test',
        },
        page.userId
      )) || [[], 0]

      expect(count).to.eq(1)
      expect(searchResults[0].id).to.eq(highlightId)
    })
  })
})
