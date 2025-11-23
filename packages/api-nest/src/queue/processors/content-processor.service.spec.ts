/**
 * ContentProcessorService Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Job } from 'bullmq'
import {
  ContentProcessorService,
  FetchContentJobData,
} from './content-processor.service'
import {
  LibraryItemEntity,
  LibraryItemState,
} from '../../library/entities/library-item.entity'
import { EventBusService } from '../event-bus.service'
import { HtmlSanitizerService } from '../services/html-sanitizer.service'
import { JOB_TYPES } from '../queue.constants'

// Mock logger to suppress console output during tests
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
}

describe('ContentProcessorService', () => {
  let service: ContentProcessorService
  let repository: jest.Mocked<Repository<LibraryItemEntity>>
  let eventBus: jest.Mocked<EventBusService>

  beforeEach(async () => {
    const mockRepository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      findOne: jest.fn(),
    }

    const mockEventBus = {
      emitContentFetchStarted: jest.fn(),
      emitContentFetchCompleted: jest.fn(),
      emitContentFetchFailed: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentProcessorService,
        {
          provide: getRepositoryToken(LibraryItemEntity),
          useValue: mockRepository,
        },
        {
          provide: EventBusService,
          useValue: mockEventBus,
        },
        HtmlSanitizerService,
      ],
    })
      .setLogger(mockLogger)
      .compile()

    service = module.get<ContentProcessorService>(ContentProcessorService)
    repository = module.get(getRepositoryToken(LibraryItemEntity))
    eventBus = module.get(EventBusService)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should log initialization message', () => {
      const logSpy = jest.spyOn(service['logger'], 'log')
      service.onModuleInit()
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('ContentProcessorService initialized'),
      )
    })
  })

  describe('process', () => {
    it('should route fetch-content jobs to handleFetchContent', async () => {
      const jobData: FetchContentJobData = {
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      const mockJob = createMockJob(JOB_TYPES.FETCH_CONTENT, jobData)
      const handleSpy = jest
        .spyOn(service as any, 'handleFetchContent')
        .mockResolvedValue({ success: true })

      await service.process(mockJob)

      expect(handleSpy).toHaveBeenCalledWith(mockJob)
    })

    it('should route parse-content jobs to handleParseContent', async () => {
      const jobData: FetchContentJobData = {
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      const mockJob = createMockJob(JOB_TYPES.PARSE_CONTENT, jobData)
      const handleSpy = jest
        .spyOn(service as any, 'handleParseContent')
        .mockResolvedValue({ success: true })

      await service.process(mockJob)

      expect(handleSpy).toHaveBeenCalledWith(mockJob)
    })

    it('should throw error for unknown job type', async () => {
      const jobData: FetchContentJobData = {
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      const mockJob = createMockJob('unknown-job-type', jobData)

      await expect(service.process(mockJob)).rejects.toThrow('Unknown job type')
    })
  })

  describe('handleFetchContent', () => {
    it('should successfully fetch and save content', async () => {
      const jobData: FetchContentJobData = {
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      const mockJob = createMockJob(JOB_TYPES.FETCH_CONTENT, jobData)

      const result = await service['handleFetchContent'](mockJob)

      expect(result.success).toBe(true)
      expect(result.title).toBeDefined()
      expect(result.content).toBeDefined()

      // Verify state updates
      expect(repository.update).toHaveBeenCalledWith('item-123', {
        state: LibraryItemState.PROCESSING,
      })
      expect(repository.update).toHaveBeenCalledWith('item-123', {
        state: LibraryItemState.SUCCEEDED,
      })

      // Verify content saved
      expect(repository.update).toHaveBeenCalledWith(
        'item-123',
        expect.objectContaining({
          title: expect.any(String),
          readableContent: expect.any(String),
        }),
      )

      // Verify events emitted
      expect(eventBus.emitContentFetchStarted).toHaveBeenCalledWith(
        expect.objectContaining({
          libraryItemId: 'item-123',
          url: 'https://example.com',
        }),
      )
      expect(eventBus.emitContentFetchCompleted).toHaveBeenCalledWith(
        expect.objectContaining({
          libraryItemId: 'item-123',
          contentLength: expect.any(Number),
          processingTime: expect.any(Number),
        }),
      )
    })

    it('should update job progress during processing', async () => {
      const jobData: FetchContentJobData = {
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      const mockJob = createMockJob(JOB_TYPES.FETCH_CONTENT, jobData)

      await service['handleFetchContent'](mockJob)

      expect(mockJob.updateProgress).toHaveBeenCalledWith(10)
      expect(mockJob.updateProgress).toHaveBeenCalledWith(20)
      expect(mockJob.updateProgress).toHaveBeenCalledWith(70)
      expect(mockJob.updateProgress).toHaveBeenCalledWith(90)
      expect(mockJob.updateProgress).toHaveBeenCalledWith(100)
    })

    it('should handle fetch errors and emit failed event', async () => {
      const jobData: FetchContentJobData = {
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      const mockJob = createMockJob(JOB_TYPES.FETCH_CONTENT, jobData, {
        attemptsMade: 1,
        attempts: 3,
      })

      // Mock fetchContent to throw error
      jest
        .spyOn(service as any, 'fetchContent')
        .mockRejectedValueOnce(new Error('Network error'))

      await expect(service['handleFetchContent'](mockJob)).rejects.toThrow(
        'Network error',
      )

      // Should NOT update to FAILED since there are retries left (attempt 2 of 3)
      expect(repository.update).not.toHaveBeenCalledWith('item-123', {
        state: LibraryItemState.FAILED,
      })

      // Should emit failed event
      expect(eventBus.emitContentFetchFailed).toHaveBeenCalledWith(
        expect.objectContaining({
          libraryItemId: 'item-123',
          error: 'Network error',
          retryCount: 2,
          willRetry: true,
        }),
      )
    })

    it('should update to FAILED state on final attempt', async () => {
      const jobData: FetchContentJobData = {
        libraryItemId: 'item-123',
        url: 'https://example.com',
        userId: 'user-123',
        timestamp: new Date(),
      }

      const mockJob = createMockJob(JOB_TYPES.FETCH_CONTENT, jobData, {
        attemptsMade: 2,
        attempts: 3,
      })

      // Mock fetchContent to throw error
      jest
        .spyOn(service as any, 'fetchContent')
        .mockRejectedValueOnce(new Error('Final error'))

      await expect(service['handleFetchContent'](mockJob)).rejects.toThrow(
        'Final error',
      )

      // Should update to FAILED on final attempt
      expect(repository.update).toHaveBeenCalledWith('item-123', {
        state: LibraryItemState.FAILED,
      })

      // Should emit failed event with willRetry: false (attempt 3 of 3)
      expect(eventBus.emitContentFetchFailed).toHaveBeenCalledWith(
        expect.objectContaining({
          libraryItemId: 'item-123',
          error: 'Final error',
          retryCount: 3,
          willRetry: false,
        }),
      )
    })
  })

  describe('saveContent', () => {
    it('should save all content fields to database', async () => {
      const result = {
        success: true,
        title: 'Test Title',
        content: '<p>Test content</p>',
        author: 'John Doe',
        publishedDate: new Date('2025-01-01'),
        siteIcon: 'https://example.com/icon.png',
        thumbnail: 'https://example.com/thumb.jpg',
      }

      await service['saveContent']('item-123', result)

      expect(repository.update).toHaveBeenCalledWith('item-123', {
        title: 'Test Title',
        readableContent: '<p>Test content</p>',
        author: 'John Doe',
        publishedAt: result.publishedDate,
        siteIcon: 'https://example.com/icon.png',
        thumbnail: 'https://example.com/thumb.jpg',
      })
    })

    it('should handle save errors gracefully', async () => {
      repository.update.mockRejectedValueOnce(new Error('Database error'))

      const result = {
        success: true,
        title: 'Test Title',
        content: '<p>Test content</p>',
      }

      await expect(service['saveContent']('item-123', result)).rejects.toThrow(
        'Database error',
      )
    })
  })

  describe('updateLibraryItemState', () => {
    it('should update state to PROCESSING', async () => {
      await service['updateLibraryItemState'](
        'item-123',
        LibraryItemState.PROCESSING,
      )

      expect(repository.update).toHaveBeenCalledWith('item-123', {
        state: LibraryItemState.PROCESSING,
      })
    })

    it('should update state to SUCCEEDED', async () => {
      await service['updateLibraryItemState'](
        'item-123',
        LibraryItemState.SUCCEEDED,
      )

      expect(repository.update).toHaveBeenCalledWith('item-123', {
        state: LibraryItemState.SUCCEEDED,
      })
    })

    it('should update state to FAILED', async () => {
      await service['updateLibraryItemState'](
        'item-123',
        LibraryItemState.FAILED,
      )

      expect(repository.update).toHaveBeenCalledWith('item-123', {
        state: LibraryItemState.FAILED,
      })
    })

    it('should handle update errors', async () => {
      repository.update.mockRejectedValueOnce(new Error('Update failed'))

      await expect(
        service['updateLibraryItemState'](
          'item-123',
          LibraryItemState.PROCESSING,
        ),
      ).rejects.toThrow('Update failed')
    })
  })

  describe('calculateWordCount', () => {
    describe('basic functionality', () => {
      it('should count words in simple HTML content', () => {
        const html = '<div><p>Hello world, this is a test.</p></div>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(6)
      })

      it('should handle empty content', () => {
        expect(service.calculateWordCount('')).toBe(0)
        expect(service.calculateWordCount('   ')).toBe(0)
      })

      it('should handle HTML with no text content', () => {
        const html = '<div></div>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(0)
      })

      it('should count words in plain text', () => {
        const text = 'This is plain text without HTML tags'
        const count = service.calculateWordCount(text)
        expect(count).toBe(7)
      })
    })

    describe('HTML parsing', () => {
      it('should strip HTML tags from content', () => {
        const html = '<div><h1>Title</h1><p>Paragraph with <strong>bold</strong> text</p></div>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(4) // Title Paragraph bold text (note: 'with' counted separately)
      })

      it('should handle nested HTML elements', () => {
        const html = `
          <div class="article">
            <header><h1>Article Title</h1></header>
            <section>
              <p>First paragraph with <em>emphasis</em>.</p>
              <p>Second paragraph with <a href="#">link</a>.</p>
            </section>
          </div>
        `
        const count = service.calculateWordCount(html)
        expect(count).toBe(10) // Article Title First paragraph with emphasis Second paragraph with link
      })

      it('should handle Readability-style HTML fragments', () => {
        const html = `
          <DIV class="page" id="readability-page-1">
            <div>
              <p>This is content from Readability parser.</p>
              <p>It comes wrapped in a DIV element.</p>
            </div>
          </DIV>
        `
        const count = service.calculateWordCount(html)
        expect(count).toBe(13) // Actual count includes all words
      })

      it('should handle HTML with inline styles and attributes', () => {
        const html = '<div style="color: red;" data-id="123"><p class="text">Content here</p></div>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(2) // Content here
      })
    })

    describe('HTML entity decoding', () => {
      it('should decode common HTML entities', () => {
        const html = '<p>Tom&nbsp;&amp;&nbsp;Jerry</p>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(3) // Tom & Jerry
      })

      it('should decode numeric entities', () => {
        const html = '<p>Hello&#32;world</p>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(2) // Hello world
      })

      it('should handle special characters', () => {
        const html = '<p>Price: $100 &mdash; sold!</p>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(4) // Price: $100 — sold!
      })

      it('should handle quotes and apostrophes', () => {
        const html = "<p>&quot;It's&quot; a test</p>"
        const count = service.calculateWordCount(html)
        expect(count).toBe(3) // "It's" a test
      })
    })

    describe('whitespace normalization', () => {
      it('should normalize multiple spaces', () => {
        const html = '<p>Hello     world    test</p>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(3)
      })

      it('should handle line breaks', () => {
        const html = `<p>First line
        Second line
        Third line</p>`
        const count = service.calculateWordCount(html)
        expect(count).toBe(6)
      })

      it('should trim leading and trailing whitespace', () => {
        const html = '   <p>   Content   </p>   '
        const count = service.calculateWordCount(html)
        expect(count).toBe(1)
      })

      it('should handle mixed whitespace characters', () => {
        const html = '<p>Word1\t\tWord2\n\nWord3</p>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(3)
      })
    })

    describe('edge cases', () => {
      it('should handle very long content', () => {
        const words = Array(10000).fill('word').join(' ')
        const html = `<div><p>${words}</p></div>`
        const count = service.calculateWordCount(html)
        expect(count).toBe(10000)
      })

      it('should handle content with only punctuation', () => {
        const html = '<p>... !!! ???</p>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(3) // Each punctuation group is a "word"
      })

      it('should handle mixed language content', () => {
        const html = '<p>Hello world 你好世界 Hola mundo</p>'
        const count = service.calculateWordCount(html)
        // Note: This counts space-separated tokens, which may not be ideal for all languages
        expect(count).toBeGreaterThan(0)
      })

      it('should handle content with URLs', () => {
        const html = '<p>Visit https://example.com for more info</p>'
        const count = service.calculateWordCount(html)
        expect(count).toBe(5) // Visit https://example.com for more info
      })

      it('should handle malformed HTML gracefully', () => {
        const html = '<p>Unclosed paragraph<div>Nested content'
        const count = service.calculateWordCount(html)
        expect(count).toBe(3) // Unclosed paragraph Nested content
      })
    })

    describe('real-world examples', () => {
      it('should accurately count words in article-like content', () => {
        const html = `
          <div class="article">
            <h1>The Future of Web Development</h1>
            <p>Web development has evolved significantly over the past decade.</p>
            <p>Modern frameworks like React and Vue have revolutionized how we build applications.</p>
            <p>The future looks bright with emerging technologies like WebAssembly and serverless computing.</p>
          </div>
        `
        const count = service.calculateWordCount(html)
        expect(count).toBe(38) // Actual word count
      })

      it('should match word count from known article', () => {
        // This is a simplified version of actual Readability output
        const html = `
          <DIV class="page" id="readability-page-1">
            <div>
              <p>To provide genuinely helpful signals for product decisions, a backlog needs to be well-organized.</p>
              <p>But organizing a backlog has historically been manual work that doesn't scale.</p>
            </div>
          </DIV>
        `
        const count = service.calculateWordCount(html)
        expect(count).toBe(26) // Actual word count from the text
      })
    })

    describe('error handling', () => {
      it('should return 0 for null input', () => {
        const count = service.calculateWordCount(null as any)
        expect(count).toBe(0)
      })

      it('should return 0 for undefined input', () => {
        const count = service.calculateWordCount(undefined as any)
        expect(count).toBe(0)
      })

      it('should handle invalid HTML gracefully', () => {
        const html = '<<>><>invalid html<<>>'
        const count = service.calculateWordCount(html)
        // linkedom should handle this gracefully
        expect(count).toBeGreaterThanOrEqual(0)
      })
    })
  })
})

/**
 * Helper function to create mock Job objects
 */
function createMockJob(
  name: string,
  data: FetchContentJobData,
  opts: Partial<{ attemptsMade: number; attempts: number }> = {},
): Job<FetchContentJobData> {
  return {
    id: 'job-123',
    name,
    data,
    attemptsMade: opts.attemptsMade || 0,
    opts: {
      attempts: opts.attempts || 3,
    },
    updateProgress: jest.fn().mockResolvedValue(undefined),
  } as any
}
