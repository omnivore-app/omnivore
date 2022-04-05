import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import {
  createTestUser,
  createUserWithoutProfile,
  deleteTestUser,
  getProfile,
} from '../db'
import { createGroup } from '../../src/services/create_group'
import {
  getUserFollowers,
  getUserFollowing,
} from '../../src/services/followers'

describe('create a user with an invite', () => {
  it('follows the other user in the group', async () => {
    after(async () => {
      await deleteTestUser(testOwner)
      await deleteTestUser(testUser)
    })

    const testOwner = 'testowner'
    const testUser = 'testuser'

    const adminUser = await createTestUser(testOwner)
    const [, invite] = await createGroup({
      admin: adminUser,
      name: 'testgroup',
    })
    const user = await createTestUser(testUser, invite.code)

    expect(await getUserFollowers(user)).to.eql([adminUser])
    expect(await getUserFollowing(user)).to.eql([adminUser])
    expect(await getUserFollowers(adminUser)).to.eql([user])
    expect(await getUserFollowing(adminUser)).not.to.eql([user])
  }).timeout(10000)

  it('creates profile when user exists but profile not', async () => {
    after(async () => {
      await deleteTestUser(name)
    })

    const name = 'userWithoutProfile'
    const user = await createUserWithoutProfile(name)

    await createTestUser(user.name)

    const profile = await getProfile(user)

    expect(profile).to.exist
  })
})
