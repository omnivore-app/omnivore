import express from 'express'
import cors from 'cors'
import { appDataSource } from './data_source'
import { env } from './env'
import { logger } from './utils/logger'
import { ContentWorker } from './workers/content-worker'

// Initialize content worker globally
let contentWorker: ContentWorker | null = null

export async function initializeApp(): Promise<express.Application> {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json())

  // Initialize database connection
  if (!appDataSource.isInitialized) {
    await appDataSource.initialize()
    logger.info('Database connection initialized')
  }

  // Initialize content worker
  if (!contentWorker) {
    contentWorker = new ContentWorker()
    await contentWorker.start()
    logger.info('Content worker initialized and started')
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      contentWorker: contentWorker?.getStatus(),
    })
  })

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`)

    if (contentWorker) {
      await contentWorker.stop()
      logger.info('Content worker stopped')
    }

    if (appDataSource.isInitialized) {
      await appDataSource.destroy()
      logger.info('Database connection closed')
    }

    process.exit(0)
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

  return app
}

export { contentWorker }
