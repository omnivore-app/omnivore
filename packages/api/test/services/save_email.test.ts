import { expect } from 'chai'
import 'mocha'
import nock from 'nock'
import { ReceivedEmail } from '../../src/entity/received_email'
import { User } from '../../src/entity/user'
import { findLibraryItemByUrl } from '../../src/services/library_item'
import { saveReceivedEmail } from '../../src/services/received_emails'
import { saveEmail } from '../../src/services/save_email'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'

describe('saveEmail', () => {
  const fakeContent = 'fake content'
  let user: User
  let scope: nock.Scope
  let receivedEmail: ReceivedEmail

  before(async () => {
    // create test user
    user = await createTestUser('fakeUser')
    scope = nock('https://blog.omnivore.app')
      .get('/fake-url')
      .reply(200)
      .persist()

    receivedEmail = await saveReceivedEmail(
      '',
      '',
      '',
      '',
      '',
      user.id,
      'non-article'
    )
  })

  after(async () => {
    await deleteUser(user.id)
    scope.persist(false)
  })

  it('doesnt fail if saved twice', async () => {
    const url = 'https://blog.omnivore.app/fake-url'
    const title = 'fake title'
    const author = 'fake author'

    await saveEmail({
      originalContent: `<html><body>${fakeContent}</body></html>`,
      url,
      title,
      author,
      userId: user.id,
      receivedEmailId: receivedEmail.id,
    })

    // This ensures row level security doesnt prevent
    // saving the same URL
    const secondResult = await saveEmail({
      originalContent: `<html><body>${fakeContent}</body></html>`,
      url,
      title,
      author,
      userId: user.id,
      receivedEmailId: receivedEmail.id,
    })
    expect(secondResult).to.not.be.undefined

    const item = await findLibraryItemByUrl(url, user.id)
    expect(item).to.exist
    expect(item?.originalUrl).to.equal(url)
    expect(item?.title).to.equal(title)
    expect(item?.author).to.equal(author)
    expect(item?.readableContent).to.contain(fakeContent)
  })
})
