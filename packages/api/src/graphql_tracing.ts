/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  ValueOrPromise,
  WithRequired,
} from 'apollo-server-plugin-base'
import { GraphQLRequestContext } from 'apollo-server-core'
import { GraphQLResolveInfo } from 'graphql'
import { ResolverContext } from './resolvers/types'
import { ResolverFn, SubscriptionResolverObject } from './generated/graphql'
import { traceAs } from './tracing'

/**
 * Replaces resolver functions with tracing-wrapped functions.
 */
export function traceResolvers(resolvers: {
  [rootKey: string]: {
    [fieldKey: string]:
      | ResolverFn<any, any, any, any>
      | SubscriptionResolverObject<any, any, any, any>
  }
}): void {
  for (const typeKey in resolvers) {
    const rootType = resolvers[typeKey]
    for (const fieldKey in rootType) {
      const resolver = rootType[fieldKey]
      const resolveFn =
        typeof resolver === 'function' ? resolver : resolver.resolve

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const wrappedResolveFn = async (
        ...resolverArgs: [any, any, ResolverContext, GraphQLResolveInfo]
      ) => {
        let info, ctx, args
        if (resolverArgs.length === 4) {
          ;[, args, ctx, info] = resolverArgs
        }
        if (!info?.path) {
          return resolveFn(...resolverArgs)
        }

        const spanName = `${typeKey}.${info.path.key}`
        return traceAs(
          {
            spanName,
            attributes: {
              'resolver.args': JSON.stringify(args),
            },
          },
          async () => {
            return resolveFn(...resolverArgs)
          }
        )
      }

      if (typeof resolver === 'function') {
        rootType[fieldKey] = wrappedResolveFn
      } else {
        ;(rootType[fieldKey] as any).resolve = wrappedResolveFn
      }
    }
  }
}

class GQLTracingPlugin implements GraphQLRequestListener<ResolverContext> {
  [key: string]: import('apollo-server-types').AnyFunction | undefined
  willSendResponse({
    context,
  }: WithRequired<
    GraphQLRequestContext<ResolverContext>,
    'metrics' | 'response'
  >): ValueOrPromise<void> {
    context.tracingSpan.end()
  }

  didEncounterErrors(
    ctx: WithRequired<
      GraphQLRequestContext<ResolverContext>,
      'metrics' | 'source' | 'errors'
    >
  ): ValueOrPromise<void> {
    const error = ctx.errors[0]
    const trxId = ctx.request.http?.headers.get('X-Transaction-ID')
    const userId = ctx.context?.claims?.uid
    ctx.context.tracingSpan.setAttributes({
      'graphql.error': true,
      'graphql.error.message': error.message,
      'request.transaction_id': trxId || '',
    })
  }
}

export const gqlTracingPlugin: ApolloServerPlugin<ResolverContext> = {
  requestDidStart({
    context: { tracingSpan, claims },
    request,
  }: GraphQLRequestContext<ResolverContext>): GraphQLRequestListener<ResolverContext> | void {
    if (request.query) {
      tracingSpan.setAttribute('graphql.query', request.query)
    }
    if (claims?.uid) {
      tracingSpan.setAttribute('user.id', claims.uid)
    }
    if (request.operationName) {
      tracingSpan.setAttribute('graphql.operationName', request.operationName)
    }
    if (request.variables) {
      tracingSpan.setAttribute(
        'graphql.variables',
        JSON.stringify(request.variables)
      )
    }
    return new GQLTracingPlugin()
  },
}
