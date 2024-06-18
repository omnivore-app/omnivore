import { DeepPartial } from 'typeorm'
import { Post } from '../entity/post'
import { Profile } from '../entity/profile'
import { authTrx, getRepository } from '../repository'

export const findPublicPostsByUserId = async (
  userId: string,
  limit: number,
  offset: number
) => {
  const posts = await getRepository(Post).find({
    where: {
      user: {
        id: userId,
        profile: {
          private: false,
        },
      },
    },
    order: {
      createdAt: 'DESC',
    },
    take: limit,
    skip: offset,
  })

  return posts
}

export const createPublicPost = async (
  userId: string,
  post: DeepPartial<Post>
) => {
  return authTrx(
    async (trx) => {
      const newPost = await trx.getRepository(Post).save(post)

      // Make user profile public when user creates a post
      await trx.getRepository(Profile).update(
        { user: { id: userId } },
        {
          private: false,
        }
      )

      return newPost
    },
    {
      uid: userId,
    }
  )
}

export const createPosts = async (
  userId: string,
  posts: Array<DeepPartial<Post>>
) => {
  return authTrx(async (trx) => trx.getRepository(Post).save(posts), {
    uid: userId,
  })
}

export const deletePosts = async (userId: string, postIds: string[]) => {
  return authTrx(
    async (trx) => {
      await trx.getRepository(Post).delete(postIds)
    },
    {
      uid: userId,
    }
  )
}

export const findPublicPostById = async (id: string) => {
  return getRepository(Post).findOneBy({
    id,
    user: {
      profile: {
        private: false,
      },
    },
  })
}
