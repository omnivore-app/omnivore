import 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import 'chai/register-should'
import fs from 'fs'
import {
  getTitleFromEmailSubject,
  isProbablyArticle,
  parseEmailAddress,
  parsePageMetadata,
  parsePreparedContent,
} from '../../src/utils/parser'
import nock from 'nock'
import chaiAsPromised from 'chai-as-promised'
import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'

chai.use(chaiAsPromised)

const load = (path: string): string => {
  return fs.readFileSync(path, 'utf8')
}

describe('parseMetadata', async () => {
  it('gets author, title, image, description', async () => {
    const html = load('./test/utils/data/substack-post.html')
    const metadata = await parsePageMetadata(html)
    expect(metadata?.author).to.deep.equal('Omnivore')
    expect(metadata?.title).to.deep.equal('Code Block Syntax Highlighting')
    expect(metadata?.previewImage).to.deep.equal(
      'https://cdn.substack.com/image/fetch/w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2ab1f7e8-2ca7-4011-8ccb-43d0b3bd244f_1490x2020.png'
    )
    expect(metadata?.description).to.deep.equal(
      'Highlighted <code> in Omnivore'
    )
  })
})

describe('parsePreparedContent', async () => {
  it('gets published date when JSONLD fails to load', async () => {
    nock('https://stratechery.com:443', {"encodedQueryParams":true})
      .get('/wp-json/oembed/1.0/embed')
      .query({"url":"https%3A%2F%2Fstratechery.com%2F2016%2Fits-a-tesla%2F"})
      .reply(401)

    const html = load('./test/utils/data/stratechery-blog-post.html')
    const result = await parsePreparedContent('https://blog.omnivore.app/', {
      document: html,
      pageInfo: {},
    })

    expect(result.parsedContent?.publishedDate?.getTime()).to.equal(
      new Date('2016-04-05T15:27:51+00:00').getTime()
    )
  })
})

describe('parsePreparedContent', async () => {
  nock('https://oembeddata').get('/').reply(200, {
    version: '1.0',
    provider_name: 'Hippocratic Adventures',
    provider_url: 'https://www.hippocraticadventures.com',
    title:
      'The Ultimate Guide to Practicing Medicine in Singapore &#8211; Part 2',
  })

  it('gets metadata from external JSONLD if available', async () => {
    const html = `<html>
                    <head>
                    <link rel="alternate" type="application/json+oembed" href="https://oembeddata">
                    </link
                    </head>
                    <body>body</body>
                    </html>`
    const result = await parsePreparedContent('https://blog.omnivore.app/', {
      document: html,
      pageInfo: {},
    })
    expect(result.parsedContent?.title).to.equal(
      'The Ultimate Guide to Practicing Medicine in Singapore – Part 2'
    )
  })
})

describe('isProbablyArticle', () => {
  let user: User

  before(async () => {
    user = await createTestUser('fakeUser')
  })

  after(async () => {
    await deleteTestUser(user.name)
  })

  it('returns true when email is signed up with us', async () => {
    const email = user.email
    expect(await isProbablyArticle(email, 'test subject')).to.be.true
  })

  it('returns true when subject has omnivore: prefix', async () => {
    const subject = 'omnivore: test subject'
    expect(await isProbablyArticle('test-email', subject)).to.be.true
  })
})

describe('getTitleFromEmailSubject', () => {
  it('returns the title from the email subject', () => {
    const title = 'test subject'
    const subject = `omnivore: ${title}`
    expect(getTitleFromEmailSubject(subject)).to.eql(title)
  })
})

describe('parseEmailAddress', () => {
  it('returns the name and address when in name <address> format', () => {
    const name = 'test name'
    const address = 'tester@omnivore.app'
    const parsed = parseEmailAddress(`${name} <${address}>`)
    expect(parsed.name).to.eql(name)
    expect(parsed.address).to.eql(address)
  })

  it('returns the address when in address format', () => {
    const address = 'tester@omnivore.app'
    const parsed = parseEmailAddress(address)
    expect(parsed.name).to.eql('')
    expect(parsed.address).to.eql(address)
  })
})
