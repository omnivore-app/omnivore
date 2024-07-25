import { Post } from '../../entity/post'
import {
  CreatePostError,
  CreatePostErrorCode,
  CreatePostSuccess,
  DeletePostError,
  DeletePostErrorCode,
  DeletePostSuccess,
  MutationCreatePostArgs,
  MutationDeletePostArgs,
  MutationUpdatePostArgs,
  PostEdge,
  PostErrorCode,
  PostResult,
  PostsErrorCode,
  PostsResult,
  QueryPostArgs,
  QueryPostsArgs,
  ResolverFn,
  UpdatePostError,
  UpdatePostErrorCode,
  UpdatePostSuccess,
} from '../../generated/graphql'
import {
  createPublicPost,
  deletePosts,
  findPublicPostById,
  findPublicPostsByUserId,
  updatePost,
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

  if (libraryItemIds.length === 0) {
    log.error('Invalid args', { libraryItemIds })

    return {
      errorCodes: [CreatePostErrorCode.BadRequest],
    }
  }

  const postToCreate = {
    userId: uid,
    title,
    content,
    libraryItemIds,
    highlightIds: highlightIds || undefined,
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

export const updatePostResolver = authorized<
  Merge<UpdatePostSuccess, { post?: Post }>,
  UpdatePostError,
  MutationUpdatePostArgs
>(async (_, { input }, { uid, log }) => {
  const {
    id,
    title,
    content,
    highlightIds,
    libraryItemIds,
    thought,
    thumbnail,
  } = input

  if (!id || title === null || content === null || libraryItemIds === null) {
    log.error('Invalid args', { id })

    return {
      errorCodes: [UpdatePostErrorCode.BadRequest],
    }
  }

  const result = await updatePost(uid, id, {
    title,
    content,
    highlightIds,
    libraryItemIds,
    thought,
    thumbnail,
  })

  if (!result.affected) {
    log.error('Failed to update post', { id })

    return {
      errorCodes: [UpdatePostErrorCode.Unauthorized],
    }
  }

  const post = await findPublicPostById(id)
  if (!post) {
    log.error('Post not found', { id })

    return {
      errorCodes: [UpdatePostErrorCode.Unauthorized],
    }
  }

  return {
    post,
  }
})

export const deletePostResolver = authorized<
  DeletePostSuccess,
  DeletePostError,
  MutationDeletePostArgs
>(async (_, { id }, { uid, log }) => {
  if (!id) {
    log.error('Invalid args', { id })

    return {
      errorCodes: [DeletePostErrorCode.BadRequest],
    }
  }

  const result = await deletePosts(uid, [id])

  if (!result.affected) {
    log.error('Failed to delete post', { id })

    return {
      errorCodes: [DeletePostErrorCode.Unauthorized],
    }
  }

  return {
    success: true,
  }
})
