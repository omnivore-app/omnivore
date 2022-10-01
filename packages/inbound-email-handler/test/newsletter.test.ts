import { expect } from 'chai'
import {
  getConfirmationCode,
  isConfirmationEmail,
  parseUnsubscribe,
} from '../src/newsletter'

describe('Confirmation email test', () => {
  describe('#isConfirmationEmail()', () => {
    let from: string
    let subject: string

    it('returns true when email is from Gmail Team', () => {
      from = 'Gmail Team <forwarding-noreply@google.com>'
      subject = `(#123456789) Gmail Forwarding Confirmation - Receive Mail from test@omnivore.app`

      expect(isConfirmationEmail(from, subject)).to.be.true
    })

    it('returns true when email is from Japan Gmail Team', () => {
      from = 'SWG チーム <forwarding-noreply@google.com>'
      subject =
        '（#123456789）SWG の転送の確認 - test@omnivore.app からメールを受信'

      expect(isConfirmationEmail(from, subject)).to.be.true
    })
  })

  describe('#getConfirmationCode()', () => {
    let code: string
    let subject: string

    it('returns the confirmation code from the email', () => {
      code = '123456789'
      subject = `(#${code}) Gmail Forwarding Confirmation - Receive Mail from test@omnivore.app`

      expect(getConfirmationCode(subject)).to.equal(code)
    })

    it('returns the confirmation code from the Google Japan email', () => {
      code = '123456789'
      subject = `（#${code}）SWG の転送の確認 - test@omnivore.app からメールを受信`

      expect(getConfirmationCode(subject)).to.equal(code)
    })
  })
})

describe('Newsletter email test', () => {
  describe('get unsubscribe from header', () => {
    const mailTo = 'unsub@omnivore.com'
    const httpUrl = 'https://omnivore.com/unsubscribe'

    it('returns mail to address if exists', () => {
      const header = `<https://omnivore.com/unsub>, <mailto:${mailTo}>`

      expect(parseUnsubscribe(header).mailTo).to.equal(mailTo)
    })

    it('returns http url if exists', () => {
      const header = `<${httpUrl}>`

      expect(parseUnsubscribe(header).httpUrl).to.equal(httpUrl)
    })

    context('when unsubscribe header rfc2047 encoded', () => {
      it('returns mail to address if exists', () => {
        const header = `=?us-ascii?Q?=3Cmailto=3A654e9594-184c-4884-8e02-e6e58a3a6871+87e39b3d-c3ca-4be?= =?us-ascii?Q?b-ba4d-977cc2ba61e7+067a353f-f775-4f2c-?= =?us-ascii?Q?a5cc-978df38deeca=40unsub=2Ebeehiiv=2Ecom=3E=2C?= =?us-ascii?Q?_=3Chttps=3A=2F=2Fwww=2Emilkroad=2Ecom=2Fsubscribe=2F87e39b3d-c3ca-4beb-ba4d-97?= =?us-ascii?Q?7cc2ba61e7=2Fmanage=3Fpost=5Fid=3D067a353f-f775?= =?us-ascii?Q?-4f2c-a5cc-978df38deeca=3E?=',`

        expect(parseUnsubscribe(header).mailTo).to.equal(
          '654e9594-184c-4884-8e02-e6e58a3a6871+87e39b3d-c3ca-4beb-ba4d-977cc2ba61e7+067a353f-f775-4f2c-a5cc-978df38deeca@unsub.beehiiv.com'
        )
      })
    })
  })
})
