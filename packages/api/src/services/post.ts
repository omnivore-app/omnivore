import { Post } from '../entity/post'
import { getRepository } from '../repository'

export const findPostsByUserId = async (
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
