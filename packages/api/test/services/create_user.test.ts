import 'mocha'
import chai, { expect } from 'chai'
import {
  createTestUser,
  createUserWithoutProfile,
  deleteTestUser,
  getProfile,
} from '../db'
import { createGroup } from '../../src/services/groups'
import {
  getUserFollowers,
  getUserFollowing,
} from '../../src/services/followers'
import { StatusType } from '../../src/datalayer/user/model'
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import * as util from '../../src/utils/sendEmail'
import { MailDataRequired } from '@sendgrid/helpers/classes/mail'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/entity/utils'

chai.use(sinonChai)

describe('create user', () => {
  context('create a user with an invite', () => {
    it('follows the other user in the group', async () => {
      after(async () => {
        const testUser = await getRepository(User).findOneBy({
          name: 'testuser',
        })
        await deleteTestUser(testUser!.id)
        const testOwner = await getRepository(User).findOneBy({
          name: 'testowner',
        })
        await deleteTestUser(testOwner!.id)
      })

      const testOwner = 'testowner'
      const testUser = 'testuser'

      const adminUser = await createTestUser(testOwner)
      const admninIds = [adminUser.id]
      const [, invite] = await createGroup({
        admin: adminUser,
        name: 'testgroup',
      })
      const user = await createTestUser(testUser, invite.code)
      const userIds = [user.id]

      const userFollowers = await getUserFollowers(user)
      const userFollowing = await getUserFollowing(user)
      const adminUserFollowers = await getUserFollowers(adminUser)
      const adminUserFollowing = await getUserFollowing(adminUser)
      expect(userFollowers.map(u => u.id)).to.eql(admninIds)
      expect(userFollowing.map(u => u.id)).to.eql(admninIds)
      expect(adminUserFollowers.map(u => u.id)).to.eql(userIds)
      expect(adminUserFollowing.map(u => u.id)).to.eql(userIds)
    })

    it('creates profile when user exists but profile not', async () => {
      after(async () => {
        const user = await getRepository(User).findOneBy({
          name: 'userWithoutProfile',
        })
        await deleteTestUser(user!.id)
      })

      const name = 'userWithoutProfile'
      const user = await createUserWithoutProfile(name)

      await createTestUser(user.name)

      const profile = await getProfile(user)

      expect(profile).to.exist
    })
  })

  context('create a user with pending confirmation', () => {
    const name = 'pendingUser'
    let fake: (msg: MailDataRequired) => Promise<boolean>

    context('when email sends successfully', () => {
      beforeEach(() => {
        fake = sinon.replace(util, 'sendEmail', sinon.fake.resolves(true))
      })

      afterEach(async () => {
        sinon.restore()
        const user = await getRepository(User).findOneBy({ name })
        await deleteTestUser(user!.id)
      })

      it('creates the user with pending status and correct name', async () => {
        const user = await createTestUser(name, undefined, undefined, true)

        expect(user.status).to.eql(StatusType.Pending)
        expect(user.name).to.eql(name)
      })

      it('sends an email to the user', async () => {
        await createTestUser(name, undefined, undefined, true)

        expect(fake).to.have.been.calledOnce
      })
    })

    context('when failed to send email', () => {
      before(() => {
        fake = sinon.replace(util, 'sendEmail', sinon.fake.resolves(false))
      })

      after(async () => {
        sinon.restore()
        const user = await getRepository(User).findOneBy({ name })
        await deleteTestUser(user!.id)
      })

      it('rejects with error', async () => {
        return expect(createTestUser(name, undefined, undefined, true)).to.be
          .rejected
      })
    })
  })
})
