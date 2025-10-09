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
