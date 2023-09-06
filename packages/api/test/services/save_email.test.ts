import { expect } from 'chai'
import 'mocha'
import nock from 'nock'
import { User } from '../../src/entity/user'
import { findLibraryItemByUrl } from '../../src/services/library_item'
import { saveEmail } from '../../src/services/save_email'
import { createTestUser, deleteTestUser } from '../db'

describe('saveEmail', () => {
  const fakeContent = 'fake content'
  let user: User
  let scope: nock.Scope

  before(async () => {
    // create test user
    user = await createTestUser('fakeUser')
    scope = nock('https://blog.omnivore.app')
      .get('/fake-url')
      .reply(200)
      .persist()
  })

  after(async () => {
    await deleteTestUser(user.id)
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
      receivedEmailId: 'fakeId',
    })

    // This ensures row level security doesnt prevent
    // saving the same URL
    const secondResult = await saveEmail({
      originalContent: `<html><body>${fakeContent}</body></html>`,
      url,
      title,
      author,
      userId: user.id,
      receivedEmailId: 'fakeId',
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
