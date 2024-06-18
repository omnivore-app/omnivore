import { Post } from '../../entity/post'
import {
  PostEdge,
  PostsErrorCode,
  PostsResult,
  QueryPostsArgs,
  ResolverFn,
} from '../../generated/graphql'
import { findPublicPostsByUserId } from '../../services/post'
import { Merge } from '../../util'
import { ResolverContext } from '../types'

type PartialPostEdge = Merge<
  PostEdge,
  {
    node: Post
  }
>
type PartialPostsResult = Merge<
  PostsResult,
  {
    edges?: Array<PartialPostEdge>
  }
>
export const postsResolver: ResolverFn<
  PartialPostsResult,
  never,
  ResolverContext,
  QueryPostsArgs
> = async (_, { first, after, userId }, { log }) => {
  const limit = first || 10
  const offset = parseInt(after || '0')
  if (isNaN(offset) || offset < 0 || limit > 50) {
    log.error('Invalid args', { after, first })

    return {
      errorCodes: [PostsErrorCode.BadRequest],
    }
  }

  const posts = await findPublicPostsByUserId(userId, limit + 1, offset)
  console.log(posts)

  const hasNextPage = posts.length > limit
  if (hasNextPage) {
    posts.pop()
  }
  const endCursor = String(offset + posts.length)

  const edges = posts.map((post) => ({
    cursor: endCursor,
    node: post,
  }))

  return {
    edges,
    pageInfo: {
      startCursor: String(offset),
      endCursor,
      hasPreviousPage: offset > 0,
      hasNextPage,
    },
  }
}
