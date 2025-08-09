// Use built-in express body parsing middleware to avoid requiring ESM-only body-parser
// import compression from 'compression'
import cookieParser from 'cookie-parser'
import type {
  Express,
  Application,
  Request,
  Response,
  NextFunction,
} from 'express'
import * as httpContext from 'express-http-context2'
import promBundle from 'express-prom-bundle'
import { createServer } from 'http'
import * as prom from 'prom-client'
import { config, loggers } from 'winston'
import { makeApolloServer } from './apollo'
import { appDataSource } from './data_source'
import { env } from './env'
import { redisDataSource } from './redis_data_source'
import { aiSummariesRouter } from './routers/ai_summary_router'
import { articleRouter } from './routers/article_router'
import { authRouter } from './routers/auth/auth_router'
import { mobileAuthRouter } from './routers/auth/mobile/mobile_auth_router'
import { contentRouter } from './routers/content_router'
import { digestRouter } from './routers/digest_router'
import { explainRouter } from './routers/explain_router'
import { exportRouter } from './routers/export_router'
import { integrationRouter } from './routers/integration_router'
import { localDebugRouter } from './routers/local_debug_router'
import { notificationRouter } from './routers/notification_router'
import { pageRouter } from './routers/page_router'
import { shortcutsRouter } from './routers/shortcuts_router'
import { contentServiceRouter } from './routers/svc/content'
import { emailsServiceRouter } from './routers/svc/emails'
import { emailAttachmentRouter } from './routers/svc/email_attachment'
import { followingServiceRouter } from './routers/svc/following'
import { linkServiceRouter } from './routers/svc/links'
import { newsletterServiceRouter } from './routers/svc/newsletters'
// import { remindersServiceRouter } from './routers/svc/reminders'
import { rssFeedRouter } from './routers/svc/rss_feed'
import { uploadServiceRouter } from './routers/svc/upload'
import { userServiceRouter } from './routers/svc/user'
import { webhooksServiceRouter } from './routers/svc/webhooks'
import { taskRouter } from './routers/task_router'
import { textToSpeechRouter } from './routers/text_to_speech'
import { sentryConfig } from './sentry'
import { analytics } from './utils/analytics'
import { corsConfig } from './utils/corsConfig'
import { getClientFromUserAgent } from './utils/helpers'
import { buildLogger, buildLoggerTransport, logger } from './utils/logger'
import { apiHourLimiter, apiLimiter, authLimiter } from './utils/rate_limit'

const PORT = process.env.PORT || 4000

export const createApp = async (): Promise<Application> => {
  // Dynamically import Express to avoid static require() of ES module
  const expressModule = await import('express')
  const expressFn = expressModule.default || expressModule
  const app: Application = (expressFn as any)()

  // Initialize Sentry dynamically to avoid static require() of ES module
  const Sentry = await import('@sentry/node')
  const { CaptureConsole } = await import('@sentry/integrations')
  const sentryRuntimeConfig = {
    ...sentryConfig,
    // integrations: [
    //   new Sentry.Integrations.OnUncaughtException(),
    //   new CaptureConsole({ levels: ['error'] }),
    // ],
  }
  // Sentry.init(sentryRuntimeConfig)
  // app.use(Sentry.Handlers.requestHandler())
  // app.use(Sentry.Handlers.tracingHandler())

  app.use(cookieParser())
  // Body parsing using dynamically loaded Express
  app.use(expressFn.json({ limit: '100mb' }))
  app.use(expressFn.urlencoded({ limit: '100mb', extended: true }))
  // app.use(compression())

  app.set('trust proxy', env.server.trustProxy)

  app.use('/api/', apiLimiter, apiHourLimiter)

  app.use(httpContext.middleware)
  app.use('/api/', (req: Request, _res: Response, next: NextFunction) => {
    const userAgent = req.header('User-Agent')
    if (userAgent) {
      const client = getClientFromUserAgent(userAgent)
      httpContext.set('client', client)
    }

    const client = req.header('X-OmnivoreClient')
    if (client) {
      httpContext.set('client', client)
    }

    next()
  })

  app.get('/_ah/health', (_req: Request, res: Response) => {
    res.sendStatus(200)
  })

  app.use('/api/auth', authLimiter, authRouter())
  app.use('/api/mobile-auth', authLimiter, mobileAuthRouter())
  app.use('/api/page', pageRouter())
  app.use('/api/shortcuts', shortcutsRouter())
  app.use('/api/article', articleRouter())
  app.use('/api/ai-summary', aiSummariesRouter())
  app.use('/api/explain', explainRouter())
  app.use('/api/text-to-speech', textToSpeechRouter())
  app.use('/api/notification', notificationRouter())
  app.use('/api/integration', integrationRouter())
  app.use('/api/tasks', taskRouter())
  app.use('/api/digest', digestRouter())
  app.use('/api/content', contentRouter())
  app.use('/api/export', exportRouter())

  app.use('/svc/pubsub/content', contentServiceRouter())
  app.use('/svc/pubsub/links', linkServiceRouter())
  app.use('/svc/pubsub/newsletters', newsletterServiceRouter())
  app.use('/svc/pubsub/emails', emailsServiceRouter())
  app.use('/svc/pubsub/upload', uploadServiceRouter())
  app.use('/svc/pubsub/webhooks', webhooksServiceRouter())
  app.use('/svc/pubsub/rss-feed', rssFeedRouter())
  app.use('/svc/pubsub/user', userServiceRouter())
  // app.use('/svc/reminders', remindersServiceRouter())
  app.use('/svc/email-attachment', emailAttachmentRouter())
  app.use('/svc/following', followingServiceRouter())

  if (env.dev.isLocal) {
    app.use('/local/debug', localDebugRouter())
  }

  app.get('/api/debug-sentry', () => {
    throw new Error('Sentry TEST error!')
  })

  // app.use(Sentry.Handlers.errorHandler())

  const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: {
      service: 'api',
    },
    promClient: {
      collectDefaultMetrics: {},
    },
  })
  // add the prometheus middleware to all routes
  app.use(metricsMiddleware)

  app.get('/metrics', async (_req: Request, res: Response) => {
    res.setHeader('Content-Type', prom.register.contentType)
    res.end(await prom.register.metrics())
  })

  return app
}

const main = async (): Promise<void> => {
  // console.log('starting with log levels', config.syslog.levels)
  // // Local dev can skip DB initialization
  // if (env.dev.isLocal) {
  //   console.warn('[api]: Skipping DB initialization in local development')
  // } else {
  //   // If creating the DB entities fails, we want this to throw
  //   // so the container will be restarted and not come online as healthy.
  //   await appDataSource.initialize()
  // }

  console.log(
    `[api]: Initializing DB connection${env.dev.isLocal ? ' (local mode)' : ''}`
  )

  await appDataSource.initialize()

  // redis is optional for the API server
  if (env.redis.cache.url) {
    await redisDataSource.initialize()
  }

  const app = await createApp()
  const httpServer = createServer(app)
  const apolloServer = await makeApolloServer(app as Express, httpServer)
  await apolloServer.start()
  // Disable ApolloServer's internal body parser since express.json() is applied globally
  apolloServer.applyMiddleware({
    app: app as any,
    path: '/api/graphql',
    cors: corsConfig,
    bodyParserConfig: false,
  })

  if (!env.dev.isLocal) {
    const mwLogger = loggers.get('express', { levels: config.syslog.levels })
    const transport = buildLoggerTransport('express')
    const lwPkg = await import('@google-cloud/logging-winston')
    const mw = await lwPkg.express.makeMiddleware(mwLogger, transport)
    app.use(mw)
  }

  const listener = httpServer.listen({ port: PORT }, () => {
    const logger = buildLogger('app.dispatch')
    logger.notice(`🚀 Server ready at ${apolloServer.graphqlPath}`)
  })

  // Avoid keepalive timeout-related connection drops manifesting in user-facing 502s.
  // See here: https://cloud.google.com/load-balancing/docs/https#timeouts_and_retries
  // and: https://cloud.google.com/appengine/docs/standard/nodejs/how-instances-are-managed#timeout
  // the backend timeout must be strictly greater than load balancer keep alive timeout.
  listener.keepAliveTimeout = 630 * 1000 // 30s more than the 10min keepalive used by appengine.
  // And a workaround for node.js bug: https://github.com/nodejs/node/issues/27363
  listener.headersTimeout = 640 * 1000 // 10s more than above
  listener.timeout = 640 * 1000 // match headersTimeout

  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`[api]: Received ${signal}, closing server...`)
    try {
      await apolloServer.stop()
      console.log('[api]: Express server stopped')

      // await analytics.shutdownAsync()
      console.log('[api]: Posthog events flushed')

      // Shutdown redis before DB because the quit sequence can
      // cause appDataSource to get reloaded in the callback
      if (env.redis.cache.url) {
        await redisDataSource.shutdown()
        console.log('[api]: Redis connection closed.')
      }

      if (!env.dev.isLocal) {
        await appDataSource.destroy()
        console.log('[api]: DB connection closed.')
      }

      // Close the HTTP server
      await new Promise<void>((resolve) => {
        listener.close(() => resolve())
      })
      console.log('[api]: HTTP server closed.')

      process.exit(0)
    } catch (error) {
      console.error('[api]: Error during shutdown:', error)
      process.exit(1)
    }
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught exception', err)
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at: Promise', { promise, reason })
  })
}

main().catch((err) => {
  console.error('Error starting server:', err)
  process.exit(1)
})
