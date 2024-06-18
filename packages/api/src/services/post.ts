import { DeepPartial } from 'typeorm'
import { Post } from '../entity/post'
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
