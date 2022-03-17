import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { createTestUser, deleteTestUser } from '../db'
import { createNewsletterEmail } from '../../src/services/newsletters'
import { saveNewsletterEmail } from '../../src/services/save_newsletter_email'
import { getPageByParam } from '../../src/elastic'
import { User } from '../../src/entity/user'
import { NewsletterEmail } from '../../src/entity/newsletter_email'

describe('saveNewsletterEmail', () => {
  const username = 'fakeUser'

  let user: User
  let email: NewsletterEmail

  before(async () => {
    user = await createTestUser(username)
    email = await createNewsletterEmail(user.id)
  })

  after(async () => {
    await deleteTestUser(username)
  })

  it('adds the newsletter to the library', async () => {
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

  it('should adds a Newsletter label to that page', async () => {
    const newLabel = {
      name: 'Newsletter',
      color: '#07D2D1',
    }

    await saveNewsletterEmail({
      email: email.address,
      content: 'fake content 2',
      url: 'https://example.com/2',
      title: 'fake title',
      author: 'fake author',
    })

    setTimeout(async () => {
      const page = await getPageByParam({ userId: user.id })
      expect(page?.labels).to.deep.include(newLabel)
    })
  })
})
