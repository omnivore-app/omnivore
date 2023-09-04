// export const getUserFollowers = async (
//   user: User,
//   offset?: number,
//   count?: number
// ): Promise<User[]> => {
//   return (
//     await getRepository(Follower).find({
//       where: { user: { id: user.id } },
//       relations: ['user', 'followee'],
//       skip: offset,
//       take: count,
//     })
//   ).map((f: Follower) => f.followee)
// }

// export const getUserFollowing = async (
//   user: User,
//   offset?: number,
//   count?: number
// ): Promise<User[]> => {
//   return (
//     await getRepository(Follower).find({
//       where: { followee: { id: user.id } },
//       relations: ['user', 'followee'],
//       skip: offset,
//       take: count,
//     })
//   ).map((f: Follower) => f.user)
// }
