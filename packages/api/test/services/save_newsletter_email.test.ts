import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import {
  createTestUser,
  deleteTestUser,
} from '../db'
import { createNewsletterEmail } from '../../src/services/newsletters'
import { saveNewsletterEmail } from '../../src/services/save_newsletter_email'
import { getRepository } from 'typeorm'
import { Link } from '../../src/entity/link'

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
