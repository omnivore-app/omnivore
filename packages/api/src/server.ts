/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import * as lw from '@google-cloud/logging-winston'
import * as Sentry from '@sentry/node'
import { ApolloServer } from 'apollo-server-express'
import { json, urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { Express } from 'express'
import * as httpContext from 'express-http-context2'
import rateLimit from 'express-rate-limit'
import { createServer, Server } from 'http'
import { config, loggers } from 'winston'
import { makeApolloServer } from './apollo'
import { appDataSource } from './data_source'
import { env } from './env'
import { articleRouter } from './routers/article_router'
import { authRouter } from './routers/auth/auth_router'
import { mobileAuthRouter } from './routers/auth/mobile/mobile_auth_router'
import { integrationRouter } from './routers/integration_router'
import { localDebugRouter } from './routers/local_debug_router'
import { notificationRouter } from './routers/notification_router'
import { pageRouter } from './routers/page_router'
import { contentServiceRouter } from './routers/svc/content'
import { emailsServiceRouter } from './routers/svc/emails'
import { emailAttachmentRouter } from './routers/svc/email_attachment'
import { integrationsServiceRouter } from './routers/svc/integrations'
import { linkServiceRouter } from './routers/svc/links'
import { newsletterServiceRouter } from './routers/svc/newsletters'
// import { remindersServiceRouter } from './routers/svc/reminders'
import { rssFeedRouter } from './routers/svc/rss_feed'
import { uploadServiceRouter } from './routers/svc/upload'
import { webhooksServiceRouter } from './routers/svc/webhooks'
import { textToSpeechRouter } from './routers/text_to_speech'
import { userRouter } from './routers/user_router'
import { sentryConfig } from './sentry'
import { getClaimsByToken, getTokenByRequest } from './utils/auth'
import { corsConfig } from './utils/corsConfig'
import { buildLogger, buildLoggerTransport } from './utils/logger'

const PORT = process.env.PORT || 4000

export const createApp = (): {
  app: Express
  apollo: ApolloServer
  httpServer: Server
} => {
  const app = express()

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Sentry.init(sentryConfig)
  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())

  app.use(cookieParser())
  app.use(json({ limit: '100mb' }))
  app.use(urlencoded({ limit: '100mb', extended: true }))

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: async (req) => {
      // 100 RPM for an authenticated request, 15 for a non-authenticated request
      const token = getTokenByRequest(req)
      try {
        const claims = await getClaimsByToken(token)
        return claims ? 100 : 15
      } catch (e) {
        console.log('non-authenticated request')
        return 15
      }
    },
    keyGenerator: (req) => {
      console.log('x-forwarded-for header', req.header('x-forwarded-for'))
      return getTokenByRequest(req) || req.ip
    },
    // skip preflight requests and test requests
    skip: (req) => req.method === 'OPTIONS' || env.dev.isLocal,
  })

  // Apply the rate limiting middleware to API calls only
  app.use('/api/', apiLimiter)

  // set client info in the request context
  app.use(httpContext.middleware)
  app.use('/api/', (req, res, next) => {
    const client = req.header('X-OmnivoreClient')
    if (client) {
      httpContext.set('client', client)
    }
    next()
  })

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  // 5 RPM for auth requests
  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    // skip preflight requests and test requests
    skip: (req) => req.method === 'OPTIONS' || env.dev.isLocal,
  })

  app.use('/api/auth', authLimiter, authRouter())
  app.use('/api/mobile-auth', authLimiter, mobileAuthRouter())
  app.use('/api/page', pageRouter())
  app.use('/api/user', userRouter())
  app.use('/api/article', articleRouter())
  app.use('/api/text-to-speech', textToSpeechRouter())
  app.use('/api/notification', notificationRouter())
  app.use('/api/integration', integrationRouter())
  app.use('/svc/pubsub/content', contentServiceRouter())
  app.use('/svc/pubsub/links', linkServiceRouter())
  app.use('/svc/pubsub/newsletters', newsletterServiceRouter())
  app.use('/svc/pubsub/emails', emailsServiceRouter())
  app.use('/svc/pubsub/upload', uploadServiceRouter())
  app.use('/svc/pubsub/webhooks', webhooksServiceRouter())
  app.use('/svc/pubsub/integrations', integrationsServiceRouter())
  app.use('/svc/pubsub/rss-feed', rssFeedRouter())
  // app.use('/svc/reminders', remindersServiceRouter())
  app.use('/svc/email-attachment', emailAttachmentRouter())

  if (env.dev.isLocal) {
    app.use('/local/debug', localDebugRouter())
  }

  app.get('/api/debug-sentry', () => {
    throw new Error('Sentry TEST error!')
  })

  // The error handler must be before any other error middleware and after all routes
  app.use(Sentry.Handlers.errorHandler())

  const apollo = makeApolloServer()
  const httpServer = createServer(app)

  return { app, apollo, httpServer }
}

const main = async (): Promise<void> => {
  console.log('starting with log levels', config.syslog.levels)
  // If creating the DB entities fails, we want this to throw
  // so the container will be restarted and not come online
  // as healthy.
  await appDataSource.initialize()

  const { app, apollo, httpServer } = createApp()

  await apollo.start()
  apollo.applyMiddleware({ app, path: '/api/graphql', cors: corsConfig })

  if (!env.dev.isLocal) {
    const mwLogger = loggers.get('express', { levels: config.syslog.levels })
    const transport = buildLoggerTransport('express')
    const mw = await lw.express.makeMiddleware(mwLogger, transport)
    app.use(mw)
  }

  const listener = httpServer.listen({ port: PORT }, async () => {
    const logger = buildLogger('app.dispatch')
    logger.notice(`🚀 Server ready at ${apollo.graphqlPath}`)
  })

  // Avoid keepalive timeout-related connection drops manifesting in user-facing 502s.
  // See here: https://cloud.google.com/load-balancing/docs/https#timeouts_and_retries
  // and: https://cloud.google.com/appengine/docs/standard/nodejs/how-instances-are-managed#timeout
  // the backend timeout must be strictly greater than load balancer keep alive timeout.
  listener.keepAliveTimeout = 630 * 1000 // 30s more than the 10min keepalive used by appengine.
  // And a workaround for node.js bug: https://github.com/nodejs/node/issues/27363
  listener.headersTimeout = 640 * 1000 // 10s more than above
  listener.timeout = 640 * 1000 // match headersTimeout
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main()
}
