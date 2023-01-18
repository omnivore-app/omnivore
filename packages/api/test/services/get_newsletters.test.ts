import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { createTestUser, deleteTestUser } from '../db'
import {
  createNewsletterEmail,
  getNewsletterEmails,
} from '../../src/services/newsletters'
import { User } from '../../src/entity/user'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import exp from 'constants'

describe('getNewsletters', () => {
  let user: User
  let email: NewsletterEmail

  before(async () => {
    user = await createTestUser('fakeUser')
    email = await createNewsletterEmail(user.id)
  })

  after(async () => {
    await deleteTestUser(user.id)
  })

  it('returns the active newsletters', async () => {
    const res = await getNewsletterEmails(user.id)
    expect(res.length).to.eql(1)
    expect(res)
  })
})
