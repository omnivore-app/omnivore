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
    const url = 'https://blog.omnivore.app/fake-url'
    const title = 'fake title'
    const author = 'fake author'
    const user = await createTestUser(username)
    const ctx: SaveContext = {
      pubsub: createPubSubClient(),
      uid: user.id,
      refresh: true,
    }

    await saveEmail(ctx, {
      originalContent: `<html><body>${fakeContent}</body></html>`,
      url,
      title,
      author,
    })

    // This ensures row level security doesnt prevent
    // saving the same URL
    const secondResult = await saveEmail(ctx, {
      originalContent: `<html><body>${fakeContent}</body></html>`,
      url,
      title,
      author,
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
