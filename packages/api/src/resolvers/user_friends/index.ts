// export const setFollowResolver = authorized<
//   SetFollowSuccess,
//   SetFollowError,
//   MutationSetFollowArgs
// >(
//   async (
//     _,
//     { input: { userId: friendUserId, follow } },
//     { models, authTrx, claims: { uid } }
//   ) => {
//     const user = await models.user.getUserDetails(uid, friendUserId)
//     if (!user) return { errorCodes: [SetFollowErrorCode.NotFound] }

//     const userFriendRecord = await authTrx((tx) =>
//       models.userFriends.getByUserFriendId(uid, friendUserId, tx)
//     )

//     if (follow) {
//       if (!userFriendRecord) {
//         await authTrx((tx) =>
//           models.userFriends.create({ friendUserId, userId: uid }, tx)
//         )
//       }
//     } else if (userFriendRecord) {
//       await authTrx((tx) => models.userFriends.delete(userFriendRecord.id, tx))
//     }

//     const updatedUser = await models.user.getUserDetails(uid, friendUserId)
//     if (!updatedUser) return { errorCodes: [SetFollowErrorCode.NotFound] }

//     return {
//       updatedUser: {
//         ...userDataToUser(updatedUser),
//         isFriend: updatedUser.viewerIsFollowing,
//       },
//     }
//   }
// )

// const getUserList = async (
//   uid: string,
//   users: UserData[],
//   models: DataModels,
//   authTrx: <TResult>(
//     cb: (tx: Knex.Transaction) => TResult,
//     userRole?: string
//   ) => Promise<TResult>
// ): Promise<User[]> => {
//   const usersIds = users.map(({ id }) => id)
//   const friends = await authTrx((tx) =>
//     models.userFriends.getByFriendIds(uid, usersIds, tx)
//   )

//   const friendsIds = friends.map(({ friendUserId }) => friendUserId)
//   users = users.map((f) => ({
//     ...f,
//     isFriend: friendsIds.includes(f.id),
//     viewerIsFollowing: friendsIds.includes(f.id),
//   }))

//   return users.map((u) => userDataToUser(u))
// }

// export const getFollowersResolver: ResolverFn<
//   GetFollowersResult,
//   unknown,
//   WithDataSourcesContext,
//   QueryGetFollowersArgs
// > = async (_parent, { userId }, { models, claims, authTrx }) => {
//   const followers = userId
//     ? await authTrx((tx) => models.user.getUserFollowersList(userId, tx))
//     : []
//   if (!claims?.uid) return { followers: usersWithNoFriends(followers) }
//   return {
//     followers: await getUserList(claims?.uid, followers, models, authTrx),
//   }
// }

// export const getFollowingResolver: ResolverFn<
//   GetFollowingResult,
//   unknown,
//   WithDataSourcesContext,
//   QueryGetFollowingArgs
// > = async (_parent, { userId }, { models, claims, authTrx }) => {
//   const following = userId
//     ? await authTrx((tx) => models.user.getUserFollowingList(userId, tx))
//     : []
//   if (!claims?.uid) return { following: usersWithNoFriends(following) }
//   return {
//     following: await getUserList(claims?.uid, following, models, authTrx),
//   }
// }

// const usersWithNoFriends = (users: UserData[]): User[] => {
//   return users.map((f) =>
//     userDataToUser({
//       ...f,
//       isFriend: false,
//     } as UserData)
//   )
// }
