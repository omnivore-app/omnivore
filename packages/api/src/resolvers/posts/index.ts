import { Post } from '../../entity/post'
import {
  CreatePostError,
  CreatePostErrorCode,
  CreatePostSuccess,
  MutationCreatePostArgs,
  PostEdge,
  PostErrorCode,
  PostResult,
  PostsErrorCode,
  PostsResult,
  QueryPostArgs,
  QueryPostsArgs,
  ResolverFn,
} from '../../generated/graphql'
import {
  createPosts,
  createPublicPost,
  findPublicPostById,
  findPublicPostsByUserId,
} from '../../services/post'
import { Merge } from '../../util'
import { authorized } from '../../utils/gql-utils'
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

export const postResolver: ResolverFn<
  Merge<PostResult, { post?: Post }>,
  never,
  ResolverContext,
  QueryPostArgs
> = async (_, { id }, { log }) => {
  if (!id) {
    log.error('Invalid args', { id })

    return {
      errorCodes: [PostErrorCode.BadRequest],
    }
  }

  const post = await findPublicPostById(id)

  if (!post) {
    log.error('Post not found', { id })

    return {
      errorCodes: [PostErrorCode.NotFound],
    }
  }

  return {
    post,
  }
}

export const createPostResolver = authorized<
  Merge<CreatePostSuccess, { post: Post }>,
  CreatePostError,
  MutationCreatePostArgs
>(async (_, { input }, { uid, log }) => {
  const { title, content, highlightIds, libraryItemIds, thought, thumbnail } =
    input

  const postToCreate = {
    userId: uid,
    title,
    content,
    highlightIds: highlightIds || undefined,
    libraryItemIds: libraryItemIds || undefined,
    thought: thought || undefined,
    thumbnail: thumbnail || undefined,
  }

  const post = await createPublicPost(uid, postToCreate)
  if (!post) {
    log.error('Failed to create post', { postToCreate })

    return {
      errorCodes: [CreatePostErrorCode.Unauthorized],
    }
  }

  return {
    post,
  }
})
