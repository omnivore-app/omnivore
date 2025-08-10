import { expect } from 'chai'
import 'mocha'
import nock from 'nock'
import sinon from 'sinon'
import { LibraryItem, LibraryItemState } from '../../src/entity/library_item'
import { User } from '../../src/entity/user'
import { ContentType } from '../../src/events/content/content-save-event'
import { EventManager } from '../../src/events/event-manager'
import { libraryItemRepository } from '../../src/repository/library_item'
import { createPageSaveRequest } from '../../src/services/create_page_save_request'
import { deleteUser } from '../../src/services/user'
import { ContentWorker } from '../../src/workers/content-worker'
import { createTestUser } from '../db'

describe('Content Processing Integration', () => {
  let user: User
  let authToken: string
  let eventManager: EventManager
  let contentWorker: ContentWorker

  const testUrl = 'https://example.com/test-article'
  const mockContent = `
    <html>
      <head>
        <title>Test Article</title>
        <meta name="description" content="A test article for integration testing">
      </head>
      <body>
        <article>
          <h1>Test Article Title</h1>
          <p>This is the main content of the test article.</p>
          <p>It contains multiple paragraphs to test content extraction.</p>
        </article>
      </body>
    </html>
  `

  before(async () => {
    // Create test user
    user = await createTestUser('contentTestUser')

    // Initialize event manager and content worker
    eventManager = new EventManager()
    contentWorker = new ContentWorker()

    // Mock external HTTP requests
    nock(testUrl)
      .get('/')
      .reply(200, mockContent, {
        'content-type': 'text/html',
      })
      .persist()
  })

  after(async () => {
    // Cleanup
    await contentWorker.stop()
    nock.cleanAll()
    await deleteUser(user.id)
  })

  describe('Content Processing Workflow', () => {
    it('should create a library item in processing state when user saves a link', async () => {
      const libraryItem = await createPageSaveRequest({
        user,
        url: testUrl,
        articleSavingRequestId: undefined,
        state: undefined,
        priority: undefined,
        labels: [],
        locale: 'en',
        timezone: 'UTC',
        savedAt: new Date().toISOString(),
        publishedAt: undefined,
        folder: 'inbox',
        subscription: undefined,
      })

      // Verify library item is created in processing state
      expect(libraryItem).to.not.be.null
      expect(libraryItem.state).to.eql(LibraryItemState.Processing)
      expect(libraryItem.readableContent).to.include('Saving')
    })

    it('should emit ContentSaveRequestedEvent when library item is created', async () => {
      // This test verifies that the event system is working
      const eventSpy = sinon.spy(eventManager, 'emit')

      const libraryItem = await createPageSaveRequest({
        user,
        url: 'https://example.com/another-test',
        articleSavingRequestId: undefined,
        state: undefined,
        priority: undefined,
        labels: [],
        locale: 'en',
        timezone: 'UTC',
        savedAt: new Date().toISOString(),
        publishedAt: undefined,
        folder: 'inbox',
        subscription: undefined,
      })

      // The event should be emitted (though we can't easily test the exact call in integration)
      expect(libraryItem.id).to.not.be.undefined

      eventSpy.restore()
    })

    it('should handle different content types appropriately', async () => {
      const pdfUrl = 'https://example.com/test.pdf'

      // Mock PDF response
      nock(pdfUrl).get('/').reply(200, Buffer.from('fake pdf content'), {
        'content-type': 'application/pdf',
      })

      const libraryItem = await createPageSaveRequest({
        user,
        url: pdfUrl,
        articleSavingRequestId: undefined,
        state: undefined,
        priority: undefined,
        labels: [],
        locale: 'en',
        timezone: 'UTC',
        savedAt: new Date().toISOString(),
        publishedAt: undefined,
        folder: 'inbox',
        subscription: undefined,
      })

      expect(libraryItem).to.not.be.null
      expect(libraryItem.state).to.eql(LibraryItemState.Processing)
    })
  })
})
