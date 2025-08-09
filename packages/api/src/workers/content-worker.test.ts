import { ContentWorker } from './content-worker'

describe('ContentWorker', () => {
  let worker: ContentWorker

  beforeEach(() => {
    // Clear any existing timers
    jest.clearAllTimers()
  })

  afterEach(async () => {
    // Ensure worker is properly cleaned up
    if (worker) {
      await worker.shutdown()
      worker = null as any
    }

    // Clear any remaining timers
    jest.clearAllTimers()
  })

  describe('initialization', () => {
    it('should start and be running', () => {
      worker = new ContentWorker(1)
      expect(worker.isRunning()).toBe(true)
    })

    it('should have correct status', () => {
      worker = new ContentWorker(1)
      const status = worker.getStatus()
      expect(status).toEqual({
        isRunning: true,
        queueName: 'content-processing',
        concurrency: 1,
      })
    })
  })

  describe('lifecycle', () => {
    it('should shutdown gracefully', async () => {
      worker = new ContentWorker(1)
      expect(worker.isRunning()).toBe(true)
      await worker.shutdown()
      expect(worker.isRunning()).toBe(false)
    })
  })
})
