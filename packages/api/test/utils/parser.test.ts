import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import { isProbablyNewsletter } from '../../src/utils/parser'

describe('isProbablyNewsletter', () => {
  const load = (path: string): string => {
    return fs.readFileSync(path, 'utf8')
  }
  it('returns true for substack newsletter', () => {
    const html = load('./test/utils/data/substack-forwarded-newsletter.html')
    isProbablyNewsletter(html).should.be.true
  })
  it('returns false for substack welcome email', () => {
    const html = load('./test/utils/data/substack-forwarded-welcome-email.html')
    isProbablyNewsletter(html).should.be.false
  })
})
