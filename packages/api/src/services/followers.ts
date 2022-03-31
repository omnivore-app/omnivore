import { User } from '../entity/user'
import { Follower } from '../entity/follower'
import { AppDataSource } from '../server'

export const getUserFollowers = async (
  user: User,
  offset?: number,
  count?: number
): Promise<User[]> => {
  return (
    await AppDataSource.getRepository(Follower).find({
      where: { user: user },
      relations: ['user', 'followee'],
      skip: offset,
      take: count,
    })
  ).map((f: Follower) => f.followee)
}

export const getUserFollowing = async (
  user: User,
  offset?: number,
  count?: number
): Promise<User[]> => {
  return (
    await AppDataSource.getRepository(Follower).find({
      where: { followee: user },
      relations: ['user', 'followee'],
      skip: offset,
      take: count,
    })
  ).map((f: Follower) => f.user)
}
