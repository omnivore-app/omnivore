/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import { makeExecutableSchema } from '@graphql-tools/schema'
import * as Sentry from '@sentry/node'
import { ContextFunction } from 'apollo-server-core'
import { ApolloServer } from 'apollo-server-express'
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer'
import * as jwt from 'jsonwebtoken'
import { Knex } from 'knex'
import { promisify } from 'util'
import { kx } from './datalayer/knex_config'
import { createPubSubClient } from './datalayer/pubsub'
import { sanitizeDirectiveTransformer } from './directives'
import { env } from './env'
import { functionResolvers } from './resolvers/function_resolvers'
import { ClaimsToSet, ResolverContext } from './resolvers/types'
import ScalarResolvers from './scalars'
import typeDefs from './schema'
import { initModels } from './server'
import { tracer } from './tracing'
import { getClaimsByToken, setAuthInCookie } from './utils/auth'
import { SetClaimsRole } from './utils/dictionary'
import { logger } from './utils/logger'

const signToken = promisify(jwt.sign)
const pubsub = createPubSubClient()

const resolvers = {
  ...functionResolvers,
  ...ScalarResolvers,
}

const contextFunc: ContextFunction<ExpressContext, ResolverContext> = async ({
  req,
  res,
}) => {
  logger.info(`handling gql request`, {
    query: req.body.query,
    variables: req.body.variables,
  })

  const token = req?.cookies?.auth || req?.headers?.authorization
  const claims = await getClaimsByToken(token)

  async function setClaims(
    tx: Knex.Transaction,
    uuid?: string,
    userRole?: string
  ): Promise<void> {
    const uid =
      (claims && claims.uid) || uuid || '00000000-0000-0000-0000-000000000000'
    const dbRole =
      userRole === SetClaimsRole.ADMIN ? 'omnivore_admin' : 'omnivore_user'
    return tx.raw('SELECT * from omnivore.set_claims(?, ?)', [uid, dbRole])
  }

  const ctx = {
    log: logger,
    claims,
    kx,
    pubsub,
    // no caching for subscriptions
    // TODO: create per request caching for connections
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    models: initModels(kx, true),
    clearAuth: () => {
      res.clearCookie('auth')
      res.clearCookie('pendingUserAuth')
    },
    signToken,
    setAuth: async (
      claims: ClaimsToSet,
      secret: string = env.server.jwtSecret
    ) => await setAuthInCookie(claims, res, secret),
    setClaims,
    authTrx: <TResult>(
      cb: (tx: Knex.Transaction) => TResult,
      userRole?: string
    ): Promise<TResult> =>
      kx.transaction(async (tx) => {
        await setClaims(tx, undefined, userRole)
        return cb(tx)
      }),
    tracingSpan: tracer.startSpan('apollo.request'),
  }

  return ctx
}

export function makeApolloServer(): ApolloServer {
  let schema = makeExecutableSchema({
    resolvers,
    typeDefs,
  })

  schema = sanitizeDirectiveTransformer(schema)

  const apollo = new ApolloServer({
    schema: schema,
    context: contextFunc,
    formatError: (err) => {
      logger.info('server error', err)
      Sentry.captureException(err)
      // hide error messages from frontend on prod
      return new Error('Unexpected server error')
    },
    introspection: env.dev.isLocal,
    persistedQueries: false,
  })

  return apollo
}
