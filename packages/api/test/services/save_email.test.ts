import { expect } from 'chai'
import 'mocha'
import nock from 'nock'
import { getPageByParam } from '../../src/elastic/pages'
import { User } from '../../src/entity/user'
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

    const page = await getPageByParam({
      userId: user.id,
      url,
    })
    expect(page).to.exist
    expect(page?.url).to.equal(url)
    expect(page?.title).to.equal(title)
    expect(page?.author).to.equal(author)
    expect(page?.content).to.contain(fakeContent)
  })
})
