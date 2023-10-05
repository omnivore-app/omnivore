import { expect } from 'chai'
import 'mocha'
import nock from 'nock'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { ReceivedEmail } from '../../src/entity/received_email'
import { Subscription } from '../../src/entity/subscription'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/repository'
import { findLibraryItemByUrl } from '../../src/services/library_item'
import { createNewsletterEmail } from '../../src/services/newsletters'
import { saveReceivedEmail } from '../../src/services/received_emails'
import { saveNewsletter } from '../../src/services/save_newsletter_email'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'

describe('saveNewsletterEmail', () => {
  const fakeContent = 'fake content'
  const title = 'fake title'
  const author = 'fake author'
  const from = 'fake from'
  const text = 'fake text'

  let user: User
  let newsletterEmail: NewsletterEmail
  let receivedEmail: ReceivedEmail

  before(async () => {
    user = await createTestUser('fakeUser')
    newsletterEmail = await createNewsletterEmail(user.id)
    receivedEmail = await saveReceivedEmail(
      from,
      newsletterEmail.address,
      title,
      text,
      '',
      user.id,
      'non-article'
    )
  })

  after(async () => {
    await deleteUser(user.id)
  })

  it('adds the newsletter to the library', async () => {
    nock('https://blog.omnivore.app').get('/fake-url').reply(200)
    nock('https://blog.omnivore.app').head('/fake-url').reply(200)
    const url = 'https://blog.omnivore.app/fake-url'

    await saveNewsletter(
      {
        from,
        email: newsletterEmail.address,
        content: `<html><body>${fakeContent}</body></html>`,
        url,
        title,
        author,
        receivedEmailId: receivedEmail.id,
        unsubHttpUrl: 'https://blog.omnivore.app/unsubscribe',
      },
      newsletterEmail
    )

    const item = await findLibraryItemByUrl(url, user.id)
    expect(item).to.exist
    expect(item?.originalUrl).to.equal(url)
    expect(item?.title).to.equal(title)
    expect(item?.author).to.equal(author)
    expect(item?.readableContent).to.contain(fakeContent)

    const subscriptions = await getRepository(Subscription).findBy({
      newsletterEmail: { id: newsletterEmail.id },
    })
    expect(subscriptions).not.to.be.empty
  })

  it('adds a Newsletter label to that page', async () => {
    nock('https://blog.omnivore.app').get('/new-fake-url').reply(200)
    nock('https://blog.omnivore.app').head('/new-fake-url').reply(200)
    const url = 'https://blog.omnivore.app/new-fake-url'
    const newLabel = {
      name: 'Newsletter',
      color: '#07D2D1',
    }

    await saveNewsletter(
      {
        email: newsletterEmail.address,
        content: `<html><body>fake content 2</body></html>`,
        url,
        title,
        author,
        from,
        receivedEmailId: receivedEmail.id,
      },
      newsletterEmail
    )

    const item = await findLibraryItemByUrl(url, user.id)
    expect(item?.labels?.[0]).to.deep.include(newLabel)
  })

  it('does not create a subscription if no unsubscribe header', async () => {
    const url = 'https://omnivore.app/no_url?q=no-unsubscribe'
    nock('https://omnivore.app').get('/no_url?q=no-unsubscribe').reply(404)

    await saveNewsletter(
      {
        email: newsletterEmail.address,
        content: `<html><body>fake content 2</body></html>`,
        url,
        title,
        author,
        from,
        receivedEmailId: receivedEmail.id,
      },
      newsletterEmail
    )

    const subscriptions = await getRepository(Subscription).findBy({
      newsletterEmail: { id: newsletterEmail.id },
      name: from,
    })
    expect(subscriptions).to.be.empty
  })
})
