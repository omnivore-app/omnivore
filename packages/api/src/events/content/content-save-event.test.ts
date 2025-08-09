import {
  ContentSaveRequestedEvent,
  ContentType,
} from '../content/content-save-event'
describe('ContentSaveRequestedEvent', () => {
  const validEventData = {
    userId: 'user-123',
    libraryItemId: 'item-123',
    url: 'https://example.com/article',
    contentType: ContentType.HTML,
    metadata: {
      source: 'test',
      savedAt: new Date().toISOString(),
    },
  }

  describe('validation', () => {
    it('should create valid event', () => {
      expect(() => new ContentSaveRequestedEvent(validEventData)).not.toThrow()
    })

    it('should reject missing userId', () => {
      const invalidData = { ...validEventData, userId: '' }
      expect(() => new ContentSaveRequestedEvent(invalidData)).toThrow(
        'userId is required'
      )
    })

    it('should reject missing libraryItemId', () => {
      const invalidData = { ...validEventData, libraryItemId: '' }
      expect(() => new ContentSaveRequestedEvent(invalidData)).toThrow(
        'libraryItemId is required'
      )
    })

    it('should reject invalid URL', () => {
      const invalidData = { ...validEventData, url: 'not-a-url' }
      expect(() => new ContentSaveRequestedEvent(invalidData)).toThrow(
        'Invalid URL format'
      )
    })

    it('should reject invalid date', () => {
      const invalidData = {
        ...validEventData,
        metadata: { ...validEventData.metadata, savedAt: 'not-a-date' },
      }
      expect(() => new ContentSaveRequestedEvent(invalidData)).toThrow(
        'Invalid savedAt date format'
      )
    })
  })

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const event = new ContentSaveRequestedEvent(validEventData)
      const serialized = event.serialize()
      const parsed = JSON.parse(serialized)

      expect(parsed.eventType).toBe('CONTENT_SAVE_REQUESTED')
      expect(parsed.userId).toBe(validEventData.userId)
      expect(parsed.url).toBe(validEventData.url)
      expect(parsed.timestamp).toBeDefined()
    })
  })

  describe('getters', () => {
    it('should provide correct getter values', () => {
      const event = new ContentSaveRequestedEvent(validEventData)

      expect(event.userId).toBe(validEventData.userId)
      expect(event.libraryItemId).toBe(validEventData.libraryItemId)
      expect(event.url).toBe(validEventData.url)
      expect(event.contentType).toBe(validEventData.contentType)
      expect(event.metadata).toEqual(validEventData.metadata)
    })
  })
})
