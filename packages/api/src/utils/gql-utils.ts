import { SelectionSetNode } from 'graphql'
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
  selectionSet: SelectionSetNode,
  fieldName: string
) => {
  // recursively check if the field is in the selection set
  for (const selection of selectionSet.selections) {
    if (selection.kind === 'Field' && selection.name.value === fieldName) {
      return true
    }

    if (
      (selection.kind === 'InlineFragment' || selection.kind === 'Field') &&
      selection.selectionSet
    ) {
      if (isFieldInSelectionSet(selection.selectionSet, fieldName)) {
        return true
      }
    }
  }

  return false
}
