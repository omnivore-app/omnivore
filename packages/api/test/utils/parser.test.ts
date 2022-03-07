import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import { findNewsletterUrl, isProbablyNewsletter, parsePageMetadata } from '../../src/utils/parser'

const load = (path: string): string => {
  return fs.readFileSync(path, 'utf8')
}

describe('isProbablyNewsletter', () => {
  it('returns true for substack newsletter', () => {
    const html = load('./test/utils/data/substack-forwarded-newsletter.html')
    isProbablyNewsletter(html).should.be.true
  })
  it('returns true for private forwarded substack newsletter', () => {
    const html = load('./test/utils/data/substack-private-forwarded-newsletter.html')
    isProbablyNewsletter(html).should.be.true
  })
  it('returns false for substack welcome email', () => {
    const html = load('./test/utils/data/substack-forwarded-welcome-email.html')
    isProbablyNewsletter(html).should.be.false
  })
  it('returns true for beehiiv.com newsletter', () => {
    const html = load('./test/utils/data/beehiiv-newsletter.html')
    isProbablyNewsletter(html).should.be.true
  })
})

describe('findNewsletterUrl', async () => {
  it('gets the URL from the header if it is a substack newsletter', async () => {
    const html = load('./test/utils/data/substack-forwarded-newsletter.html')
    const url = await findNewsletterUrl(html)
    // Not sure if the redirects from substack expire, this test could eventually fail
    expect(url).to.startWith('https://newsletter.slowchinese.net/p/companies-that-eat-people-217')
  })
  it('gets the URL from the header if it is a beehiiv newsletter', () => {
    const html = load('./test/utils/data/beehiiv-newsletter.html')
    isProbablyNewsletter(html).should.be.true
  })
  it('returns undefined if it is not a newsletter', async () => {
    const html = load('./test/utils/data/substack-forwarded-welcome-email.html')
    const url = await findNewsletterUrl(html)
    expect(url).to.be.undefined
  })
})

describe('parseMetadata', async () => {
  it('gets author, title, image, description', async () => {
    const html = load('./test/utils/data/substack-post.html')
    const metadata = await parsePageMetadata(html)
    expect(metadata?.author).to.deep.equal('Omnivore')
    expect(metadata?.title).to.deep.equal('Code Block Syntax Highlighting')
    expect(metadata?.previewImage).to.deep.equal('https://cdn.substack.com/image/fetch/w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2ab1f7e8-2ca7-4011-8ccb-43d0b3bd244f_1490x2020.png')
    expect(metadata?.description).to.deep.equal('Highlighted <code> in Omnivore')

  })
})
