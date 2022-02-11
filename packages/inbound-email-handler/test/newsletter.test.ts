import { expect } from 'chai'
import { isConfirmationEmail, isNewsletter } from '../src/newsletter'

describe('Confirmation email test', () => {
  describe('#isConfirmationEmail()', () => {
    it('returns true when email is from Gmail Team', () => {
      const from = `Gmail Team <forwarding-noreply@google.com>`

      expect(isConfirmationEmail(from)).to.be.true
    })
  })
})

describe('Newsletter email test', () => {
  describe('#isNewsletter()', () => {
    it('returns true when email is from substack', () => {
      const from = `Hongbo from Hongbo’s Newsletter <hongbo130@substack.com>`

      expect(isNewsletter(from, '')).to.be.true
    })
  })
})
