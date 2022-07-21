import 'mocha'
import chai, { expect } from 'chai'
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
import { StatusType } from '../../src/datalayer/user/model'
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import * as util from '../../src/utils/sendEmail'
import { MailDataRequired } from '@sendgrid/helpers/classes/mail'

chai.use(sinonChai)

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
    expect(await getUserFollowing(adminUser)).to.eql([user])
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

describe('create a user with pending confirmation', () => {
  const name = 'pendingUser'
  let fake: (msg: MailDataRequired) => Promise<boolean>

  beforeEach(() => {
    fake = sinon.replace(util, 'sendEmail', sinon.fake.resolves(true))
  })

  afterEach(async () => {
    sinon.restore()
    await deleteTestUser(name)
  })

  it('creates a user with pending status', async () => {
    const user = await createTestUser(name, undefined, undefined, true)

    expect(user.status).to.equal(StatusType.Pending)
  })

  it('sends an email to the user', async () => {
    await createTestUser(name, undefined, undefined, true)

    expect(fake).to.have.been.calledOnce
  })
})
