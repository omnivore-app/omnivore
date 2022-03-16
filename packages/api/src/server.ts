/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { buildLogger, buildLoggerTransport } from './utils/logger'
import { json, urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { Express } from 'express'
import { createServer, Server } from 'http'
import Knex from 'knex'
import { env } from './env'
import * as Sentry from '@sentry/node'
import * as lw from '@google-cloud/logging-winston'
import { config, loggers } from 'winston'
import { sentryConfig } from './sentry'
import { makeApolloServer } from './apollo'
import { authRouter } from './routers/auth/auth_router'
import { articleRouter } from './routers/article_router'
import { mobileAuthRouter } from './routers/auth/mobile/mobile_auth_router'
import { contentServiceRouter } from './routers/svc/content'
import { localDebugRouter } from './routers/local_debug_router'
import { Connection, createConnection } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { linkServiceRouter } from './routers/svc/links'
import UserModel from './datalayer/user'
import ArticleModel from './datalayer/article'
import UserArticleModel from './datalayer/links'
import UserFriendModel from './datalayer/user_friends'
import UserPersonalizationModel from './datalayer/user_personalization'
import ArticleSavingRequestModel from './datalayer/article_saving_request'
import UploadFileDataModel from './datalayer/upload_files'
import HighlightModel from './datalayer/highlight'
import ReactionModel from './datalayer/reaction'
import { DataModels } from './resolvers/types'
import { newsletterServiceRouter } from './routers/svc/newsletters'
import { emailsServiceRouter } from './routers/svc/emails'
import ReminderModel from './datalayer/reminders'
import { remindersServiceRouter } from './routers/svc/reminders'
import { ApolloServer } from 'apollo-server-express'
import { pdfAttachmentsRouter } from './routers/svc/pdf_attachments'
import { corsConfig } from './utils/corsConfig'
import { initElasticsearch } from './elastic'
import { pageServiceRouter } from './routers/svc/pages'

const PORT = process.env.PORT || 4000

export const initModels = (kx: Knex, cache = true): DataModels => ({
  user: new UserModel(kx, cache),
  article: new ArticleModel(kx, cache),
  userArticle: new UserArticleModel(kx, cache),
  userFriends: new UserFriendModel(kx, cache),
  userPersonalization: new UserPersonalizationModel(kx, cache),
  articleSavingRequest: new ArticleSavingRequestModel(kx, cache),
  uploadFile: new UploadFileDataModel(kx, cache),
  highlight: new HighlightModel(kx, cache),
  reaction: new ReactionModel(kx, cache),
  reminder: new ReminderModel(kx, cache),
})

const initEntities = async (): Promise<Connection> => {
  return createConnection({
    type: 'postgres',
    host: env.pg.host,
    port: env.pg.port,
    schema: 'omnivore',
    username: env.pg.userName,
    password: env.pg.password,
    database: env.pg.dbName,
    logging: ['query', 'info'],
    entities: [__dirname + '/entity/**/*{.js,.ts}'],
    subscribers: [__dirname + '/events/**/*{.js,.ts}'],
    namingStrategy: new SnakeNamingStrategy(),
  })
}

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

  // respond healthy to auto-scaler.
  app.get('/_ah/health', (req, res) => res.sendStatus(200))

  app.use('/api/auth', authRouter())
  app.use('/api/article', articleRouter())
  app.use('/api/mobile-auth', mobileAuthRouter())
  app.use('/svc/pubsub/content', contentServiceRouter())
  app.use('/svc/pubsub/links', linkServiceRouter())
  app.use('/svc/pubsub/newsletters', newsletterServiceRouter())
  app.use('/svc/pubsub/emails', emailsServiceRouter())
  app.use('/svc/pubsub/pages', pageServiceRouter())
  app.use('/svc/reminders', remindersServiceRouter())
  app.use('/svc/pdf-attachments', pdfAttachmentsRouter())

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
  // If creating the DB entities fails, we want this to throw
  // so the container will be restarted and not come online
  // as healthy.
  await initEntities()

  await initElasticsearch()

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
}

// only call main if the file was called from the CLI and wasn't required from another module
if (require.main === module) {
  main()
}
