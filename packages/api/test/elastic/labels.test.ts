import 'mocha'
import { expect } from 'chai'
import {
  ArticleSavingRequestStatus,
  Highlight,
  HighlightType,
  Label,
  Page,
  PageContext,
  PageType,
} from '../../src/elastic/types'
import { createPubSubClient } from '../../src/pubsub'
import { createPage, deletePage, getPageById } from '../../src/elastic/pages'
import { addLabelInPage, setLabelsForHighlight } from '../../src/elastic/labels'
import { addHighlightToPage } from '../../src/elastic/highlights'

describe('labels in elastic', () => {
  const userId = 'userId'
  const ctx: PageContext = {
    pubsub: createPubSubClient(),
    refresh: true,
    uid: userId,
  }

  describe('addLabelInPage', () => {
    let page: Page
    let label: Label = {
      id: 'Test label id',
      name: 'test label',
      color: '#07D2D1',
    }
    let newLabel: Label

    before(async () => {
      // create a testing page
      page = {
        id: '',
        hash: 'test hash',
        userId: userId,
        pageType: PageType.Article,
        title: 'test title',
        content: '<p>test</p>',
        slug: 'test slug',
        createdAt: new Date(),
        updatedAt: new Date(),
        savedAt: new Date(),
        readingProgressPercent: 100,
        readingProgressAnchorIndex: 0,
        url: 'https://blog.omnivore.app/p/getting-started-with-omnivore',
        archivedAt: new Date(),
        labels: [label],
        state: ArticleSavingRequestStatus.Succeeded,
      }
      page.id = (await createPage(page, ctx))!
    })

    after(async () => {
      // delete the testing page
      await deletePage(page.id, ctx)
    })

    context('when the label not exist in the page', () => {
      before(() => {
        newLabel = {
          id: 'new label id',
          name: 'new label',
          color: '#07D2D1',
        }
      })
      it('adds the label to the page', async () => {
        const result = await addLabelInPage(page.id, newLabel, ctx)
        expect(result).to.be.true

        const updatedPage = await getPageById(page.id)
        expect(updatedPage?.labels).to.deep.include(label)
      })
    })

    context('when the label exists in the page', () => {
      before(() => {
        newLabel = label
      })

      it('does not add the label to the page', async () => {
        const result = await addLabelInPage(page.id, newLabel, ctx)

        expect(result).to.be.false
      })
    })
  })

  describe('setLabelsForHighlight', () => {
    const page = {
      id: 'testPageId',
      hash: 'test set labels for highlight hash',
      userId: userId,
      pageType: PageType.Article,
      title: 'test set labels for highlight title',
      content: '<p>test</p>',
      slug: 'test set labels for highlight slug',
      createdAt: new Date(),
      savedAt: new Date(),
      readingProgressPercent: 100,
      readingProgressAnchorIndex: 0,
      url: 'https://blog.omnivore.app/p/setting-labels-for-highlight',
      state: ArticleSavingRequestStatus.Succeeded,
    }
    const highlightId = 'highlightId'
    const label: Label = {
      id: 'test label id',
      name: 'test label',
      color: '#07D2D1',
    }

    before(async () => {
      // create a testing page
      await createPage(page, ctx)

      const highlightData: Highlight = {
        patch: 'test set labels patch',
        quote: 'test set labels quote',
        shortId: 'test set labels shortId',
        id: highlightId,
        userId: page.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: HighlightType.Highlight,
      }

      await addHighlightToPage(page.id, highlightData, ctx)
    })

    after(async () => {
      await deletePage(page.id, ctx)
    })

    it('sets labels for highlights', async () => {
      const result = await setLabelsForHighlight(highlightId, [label], ctx)

      expect(result).to.be.true
    })
  })
})
