import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { createTestUser, deleteTestUser } from '../db'
import { createNewsletterEmail } from '../../src/services/newsletters'
import { saveNewsletterEmail } from '../../src/services/save_newsletter_email'
import { getPageByParam } from '../../src/elastic'

describe('saveNewsletterEmail', () => {
  const username = 'fakeUser'
  after(async () => {
    await deleteTestUser(username)
  })

  it('adds the newsletter to the library', async () => {
    const user = await createTestUser(username)
    const email = await createNewsletterEmail(user.id)

    await saveNewsletterEmail({
      email: email.address,
      content: 'fake content',
      url: 'https://example.com',
      title: 'fake title',
      author: 'fake author',
    })

    setTimeout(async () => {
      const page = await getPageByParam({ userId: user.id })
      if (!page) {
        expect.fail('page not found')
      }
      expect(page.url).to.equal('https://example.com')
      expect(page.title).to.equal('fake title')
      expect(page.author).to.equal('fake author')
      expect(page.content).to.contain('fake content')
    })
  })
})
