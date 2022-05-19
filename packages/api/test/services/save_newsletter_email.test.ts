import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { createTestUser, deleteTestUser } from '../db'
import { createNewsletterEmail } from '../../src/services/newsletters'
import { saveNewsletterEmail } from '../../src/services/save_newsletter_email'
import { User } from '../../src/entity/user'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { SaveContext } from '../../src/services/save_email'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import { getPageByParam } from '../../src/elastic/pages'

describe('saveNewsletterEmail', () => {
  const username = 'fakeUser'
  const fakeContent = 'fake content'

  let user: User
  let email: NewsletterEmail
  let ctx: SaveContext

  before(async () => {
    user = await createTestUser(username)
    email = await createNewsletterEmail(user.id)
    ctx = {
      pubsub: createPubSubClient(),
      refresh: true,
      uid: user.id,
    }
  })

  after(async () => {
    await deleteTestUser(username)
  })

  it('adds the newsletter to the library', async () => {
    await saveNewsletterEmail(
      {
        email: email.address,
        content: `<html><body>${fakeContent}</body></html>`,
        url: 'https://example.com',
        title: 'fake title',
        author: 'fake author',
      },
      ctx
    )

    const page = await getPageByParam({ userId: user.id })
    if (!page) {
      expect.fail('page not found')
    }
    expect(page.url).to.equal('https://example.com')
    expect(page.title).to.equal('fake title')
    expect(page.author).to.equal('fake author')
    expect(page.content).to.contain(fakeContent)
  })

  it('should adds a Newsletter label to that page', async () => {
    const newLabel = {
      name: 'Newsletter',
      color: '#07D2D1',
    }

    await saveNewsletterEmail(
      {
        email: email.address,
        content: `<html><body>fake content 2</body></html>`,
        url: 'https://example.com/2',
        title: 'fake title',
        author: 'fake author',
      },
      ctx
    )

    const page = await getPageByParam({ userId: user.id })
    expect(page?.labels?.[0]).to.deep.include(newLabel)
  })
})
