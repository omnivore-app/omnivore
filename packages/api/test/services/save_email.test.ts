import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { createTestUser, deleteTestUser } from '../db'
import { SaveContext, saveEmail } from '../../src/services/save_email'
import { createPubSubClient } from '../../src/datalayer/pubsub'
import { getPageByParam } from '../../src/elastic/pages'

describe('saveEmail', () => {
  const username = 'fakeUser'
  const fakeContent = 'fake content'

  after(async () => {
    await deleteTestUser(username)
  })

  it('doesnt fail if saved twice', async () => {
    const user = await createTestUser(username)
    const ctx: SaveContext = {
      pubsub: createPubSubClient(),
      uid: user.id,
      refresh: true,
    }

    await saveEmail(ctx, {
      originalContent: `<html><body>${fakeContent}</body></html>`,
      url: 'https://example.com',
      title: 'fake title',
      author: 'fake author',
    })

    // This ensures row level security doesnt prevent
    // resaving the same URL
    const secondResult = await saveEmail(ctx, {
      originalContent: `<html><body>${fakeContent}</body></html>`,
      url: 'https://example.com',
      title: 'fake title',
      author: 'fake author',
    })
    expect(secondResult).to.not.be.undefined

    const page = await getPageByParam({ userId: user.id })
    expect(page).to.exist
    expect(page?.url).to.equal('https://example.com')
    expect(page?.title).to.equal('fake title')
    expect(page?.author).to.equal('fake author')
    expect(page?.content).to.contain(fakeContent)
  })
})
