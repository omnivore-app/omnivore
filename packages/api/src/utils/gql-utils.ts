import { GraphQLResolveInfo } from 'graphql'
import { ResolverFn } from '../generated/graphql'
import { Claims, ResolverContext } from '../resolvers/types'

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
    ResolverContext & { claims: Claims; uid: string },
    TArgs
  >
): ResolverFn<TSuccess | TError, TParent, ResolverContext, TArgs> {
  return (parent, args, ctx, info) => {
    const { claims } = ctx
    if (claims?.uid) {
      return resolver(parent, args, { ...ctx, claims, uid: claims.uid }, info)
    }
    return { errorCodes: ['UNAUTHORIZED'] } as TError
  }
}

export const isFieldInSelectionSet = (
  info: GraphQLResolveInfo,
  fieldName: string
): boolean => {
  return info.fieldNodes.some((node) => {
    return node.selectionSet?.selections.some(
      (selection) =>
        selection.kind === 'Field' && selection.name.value === fieldName
    )
  })
}
