import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import { findNewsletterUrl, isProbablyNewsletter } from '../../src/utils/parser'

const load = (path: string): string => {
  return fs.readFileSync(path, 'utf8')
}

describe('isProbablyNewsletter', () => {
  it('returns true for substack newsletter', () => {
    const html = load('./test/utils/data/substack-forwarded-newsletter.html')
    isProbablyNewsletter(html).should.be.true
  })
  it('returns false for substack welcome email', () => {
    const html = load('./test/utils/data/substack-forwarded-welcome-email.html')
    isProbablyNewsletter(html).should.be.false
  })
})

describe('findNewsletterUrl', async () => {
  it('gets the URL from the header if it is a newsletter', async () => {
    const html = load('./test/utils/data/substack-forwarded-newsletter.html')
    const url = await findNewsletterUrl(html)
    // Not sure if the redirects from substack expire, this test could eventually fail
    expect(url).to.startWith('https://newsletter.slowchinese.net/p/companies-that-eat-people-217')
  })
  it('returns undefined if it is not a newsletter', async () => {
    const html = load('./test/utils/data/substack-forwarded-welcome-email.html')
    const url = await findNewsletterUrl(html)
    expect(url).to.be.undefined
  })
})
