import { EventManager } from './event-manager'
import {
  ContentSaveRequestedEvent,
  ContentType,
} from './content/content-save-event'
import { redisDataSource } from '../redis_data_source'

describe('EventManager', () => {
  let eventManager: EventManager

  beforeAll(async () => {
    if (!redisDataSource.isInitialized) {
      await redisDataSource.initialize()
    }
  })

  afterAll(async () => {
    await redisDataSource.shutdown()
  })

  beforeEach(() => {
    eventManager = EventManager.getInstance()
  })

  afterEach(async () => {
    await eventManager.shutdown()
  })

  it('should return the same instance', () => {
    const instance1 = EventManager.getInstance()
    const instance2 = EventManager.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should register and emit events', async () => {
    const event = new ContentSaveRequestedEvent({
      userId: 'test-user',
      libraryItemId: 'test-item',
      url: 'https://example.com',
      contentType: ContentType.HTML,
      metadata: {
        source: 'test',
        savedAt: new Date().toISOString(),
      },
    })

    await expect(eventManager.emit(event)).resolves.not.toThrow()
  })
})
