import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import {
  createTestUser,
  deleteTestUser,
} from '../db'
import { SaveContext, saveEmail } from '../../src/services/save_email'
import { getRepository } from 'typeorm'
import { Link } from '../../src/entity/link'
import { initModels } from '../../src/server'
import { kx } from '../../src/datalayer/knex_config'
import { createPubSubClient } from '../../src/datalayer/pubsub'

describe('saveEmail', () => {
  const username = 'fakeUser'
  after(async () => {
    await deleteTestUser(username)
  })

  it('doesnt fail if saved twice', async () => {
    const user = await createTestUser(username)
    const ctx: SaveContext = {
      models: initModels(kx, false),
      pubsub: createPubSubClient(),
    }

    await saveEmail(ctx, user.id, {
      originalContent: 'fake content',
      url: 'https://example.com',
      title: 'fake title',
      author: 'fake author',
    })

    // This ensures row level security doesnt prevent
    // resaving the same URL
    const secondResult = await saveEmail(ctx, user.id, {
      originalContent: 'fake content',
      url: 'https://example.com',
      title: 'fake title',
      author: 'fake author',
    })
    expect(secondResult).to.not.be.undefined

    const links = await getRepository(Link).find({
      where: {
        user: user,
      },
      relations: ['page'],
    })
    
    expect(links.length).to.equal(1)
    expect(links[0].page.url).to.equal('https://example.com')
    expect(links[0].page.title).to.equal('fake title')
    expect(links[0].page.author).to.equal('fake author')
    expect(links[0].page.content).to.contain('fake content')
  }).timeout(10000)
})
