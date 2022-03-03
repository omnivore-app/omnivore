import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import { isProbablyNewsletter } from '../../src/utils/parser'

describe('isProbablyNewsletter', () => {
  const load = (path: string): JSDOM => {
    const content = fs.readFileSync(path, 'utf8')
    return new JSDOM(content);
  }
  it('returns true for substack newsletter', () => {
    const dom = load('./test/utils/data/substack-forwarded-newsletter.html')
    isProbablyNewsletter(dom.window).should.be.true
  })
  it('returns false for substack welcome email', () => {
    const dom = load('./test/utils/data/substack-forwarded-welcome-email.html')
    isProbablyNewsletter(dom.window).should.be.false
  })
})
