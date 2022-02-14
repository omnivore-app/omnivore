import { expect } from 'chai'
import { isConfirmationEmail, isNewsletter } from '../src/newsletter'

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
})
