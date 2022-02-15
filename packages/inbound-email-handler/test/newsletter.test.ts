import { expect } from 'chai'
import {
  getNewsletterUrl,
  isConfirmationEmail,
  isNewsletter,
} from '../src/newsletter'

describe('Confirmation email test', () => {
  describe('#isConfirmationEmail()', () => {
    it('returns true when email is from Gmail Team', () => {
      const from = 'Gmail Team <forwarding-noreply@google.com>'

      expect(isConfirmationEmail(from)).to.be.true
    })
  })
})

describe('Newsletter email test', () => {
  describe('#isNewsletter()', () => {
    it('returns true when email is from SubStack', () => {
      const rawUrl = '<https://hongbo130.substack.com/p/tldr>'

      expect(isNewsletter(rawUrl, '')).to.be.true
    })

    it('returns true when email is from Axios', () => {
      const from = 'Mike Allen <mike@axios.com>'

      expect(isNewsletter('', from)).to.be.true
    })
  })

  describe('#getNewsletterUrl()', () => {
    it('returns url when email is from SubStack', () => {
      const rawUrl = '<https://hongbo130.substack.com/p/tldr>'

      expect(getNewsletterUrl(rawUrl, '')).to.equal(
        'https://hongbo130.substack.com/p/tldr'
      )
    })

    it('returns url when email is from Axios', () => {
      const rawUrl = ''
      const html = `View in browser at <a>https://axios.com/blog/2019/02/28/the-best-way-to-build-a-web-app</a>`

      expect(getNewsletterUrl(rawUrl, html)).to.equal(
        'https://axios.com/blog/2019/02/28/the-best-way-to-build-a-web-app'
      )
    })
  })
})
