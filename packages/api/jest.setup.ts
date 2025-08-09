// Mock problematic ESM modules
jest.mock('axios')

// Mock BullMQ with stateful Worker
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation((name: string) => ({
    add: jest.fn().mockResolvedValue({
      id: `mock-job-${Date.now()}`,
      name: 'mock-job',
      data: {},
    }),
    waitUntilReady: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  })),
  Worker: jest
    .fn()
    .mockImplementation(
      (
        queueName: string,
        processor: (job: any) => Promise<any>,
        opts?: any
      ) => {
        let running = true

        return {
          on: jest.fn(),
          isRunning: jest.fn(() => running),
          close: jest.fn().mockImplementation(() => {
            running = false
            return undefined
          }),
          concurrency: opts?.concurrency || 2,
        }
      }
    ),
}))

// Mock logger to avoid import issues
jest.mock('./src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn(() => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}))

// Mock Redis
jest.mock('./src/redis_data_source', () => ({
  redisDataSource: {
    isInitialized: true,
    workerRedisClient: {
      options: {
        host: 'localhost',
        port: 6379,
        password: undefined,
        db: 0,
      },
    },
    initialize: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
  },
}))
