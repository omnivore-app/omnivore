import { expect } from 'chai'
import { Filter } from '../../src/entity/filter'
import { StatusType, User } from '../../src/entity/user'
import { authTrx, getRepository } from '../../src/repository'
import { findProfile } from '../../src/services/profile'
import { deleteUser } from '../../src/services/user'
import {
  createTestUser,
  createUserWithoutProfile,
  deleteFiltersFromUser,
} from '../db'

describe('create user', () => {
  context('creates a user through manual sign up', () => {
    it('adds the default filters to the user', async () => {
      after(async () => {
        const testUser = await getRepository(User).findOneBy({
          name: 'filter_user',
        })
        await deleteUser(testUser!.id)
        await deleteFiltersFromUser(testUser!.id)
      })

      const user = await createTestUser('filter_user')
      const filters = await authTrx(
        (t) => t.getRepository(Filter).findBy({ user: { id: user.id } }),
        {
          uid: user.id,
        }
      )

      expect(filters).not.to.be.empty
    })
  })

  context('create a user with an invite', () => {
    // it('follows the other user in the group', async () => {
    //   after(async () => {
    //     const testUser = await getRepository(User).findOneBy({
    //       name: 'testuser',
    //     })
    //     await deleteTestUser(testUser!.id)
    //     const testOwner = await getRepository(User).findOneBy({
    //       name: 'testowner',
    //     })
    //     await deleteTestUser(testOwner!.id)
    //   })

    //   const testOwner = 'testowner'
    //   const testUser = 'testuser'

    //   const adminUser = await createTestUser(testOwner)
    //   const admninIds = [adminUser.id]
    //   const [, invite] = await createGroup({
    //     admin: adminUser,
    //     name: 'testgroup',
    //   })
    //   const user = await createTestUser(testUser, invite.code)
    //   const userIds = [user.id]

    //   const userFollowers = await getUserFollowers(user)
    //   const userFollowing = await getUserFollowing(user)
    //   const adminUserFollowers = await getUserFollowers(adminUser)
    //   const adminUserFollowing = await getUserFollowing(adminUser)
    //   expect(userFollowers.map((u) => u.id)).to.eql(admninIds)
    //   expect(userFollowing.map((u) => u.id)).to.eql(admninIds)
    //   expect(adminUserFollowers.map((u) => u.id)).to.eql(userIds)
    //   expect(adminUserFollowing.map((u) => u.id)).to.eql(userIds)
    // })

    it('creates profile when user exists but profile not', async () => {
      after(async () => {
        const user = await getRepository(User).findOneBy({
          name: 'userWithoutProfile',
        })
        await deleteUser(user!.id)
      })

      const name = 'userWithoutProfile'
      const user = await createUserWithoutProfile(name)

      await createTestUser(user.name)

      const profile = await findProfile(user)

      expect(profile).to.exist
    })
  })

  context('create a user with pending confirmation', () => {
    const name = 'pendingUser'

    context('when email sends successfully', () => {
      afterEach(async () => {
        const user = await getRepository(User).findOneBy({ name })
        await deleteUser(user!.id)
      })

      it('creates the user with pending status and correct name', async () => {
        const user = await createTestUser(name, undefined, undefined, true)

        expect(user.status).to.eql(StatusType.Pending)
        expect(user.name).to.eql(name)
      })
    })
  })
})
