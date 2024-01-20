import { ResolverFn } from '../generated/graphql'
import { Claims, WithDataSourcesContext } from '../resolvers/types'

export function authorized<
  TSuccess,
  TError extends { errorCodes: string[] },
  /* eslint-disable @typescript-eslint/no-explicit-any */
  TArgs = any,
  TParent = any
  /* eslint-enable @typescript-eslint/no-explicit-any */
>(
  resolver: ResolverFn<
    TSuccess | TError,
    TParent,
    WithDataSourcesContext & { claims: Claims },
    TArgs
  >
): ResolverFn<TSuccess | TError, TParent, WithDataSourcesContext, TArgs> {
  return (parent, args, ctx, info) => {
    const { claims } = ctx
    if (claims?.uid) {
      return resolver(parent, args, { ...ctx, claims, uid: claims.uid }, info)
    }
    return { errorCodes: ['UNAUTHORIZED'] } as TError
  }
}
