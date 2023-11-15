import { expect } from 'chai'
import 'mocha'
import parseHeaders from 'parse-headers'
import rfc2047 from 'rfc2047'
import { parsedTo, plainTextToHtml } from '../src'
import {
  getConfirmationCode,
  isGoogleConfirmationEmail,
  isSubscriptionConfirmationEmail,
  parseAuthor,
  parseUnsubscribe,
} from '../src/newsletter'

describe('Confirmation email test', () => {
  describe('#isGoogleConfirmationEmail()', () => {
    let from: string
    let subject: string

    it('returns true when email is from Gmail Team', () => {
      from = 'Gmail Team <forwarding-noreply@google.com>'
      subject = `(#123456789) Gmail Forwarding Confirmation - Receive Mail from test@omnivore.app`

      expect(isGoogleConfirmationEmail(from, subject)).to.be.true
    })

    it('returns true when email is from Japan Gmail Team', () => {
      from = 'SWG チーム <forwarding-noreply@google.com>'
      subject =
        '（#123456789）SWG の転送の確認 - test@omnivore.app からメールを受信'

      expect(isGoogleConfirmationEmail(from, subject)).to.be.true
    })

    it('returns true when email is in Spanish', () => {
      from = 'Equipo de Gmail <forwarding-noreply@google.com>'
      subject =
        'Confirmación de reenvío de 123456789 (n.º Gmail) - Recibir correo de test@omnivore.app'

      expect(isGoogleConfirmationEmail(from, subject)).to.be.true
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

    it('returns the confirmation code from the Spanish email', () => {
      code = '123456789'
      subject = `Confirmación de reenvío de ${code} (n.º Gmail) - Recibir correo de test@omnivore.app`

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
  })
})

describe('parsedTo', () => {
  it('returns envelope to if exists', () => {
    const to = 'receipient@inbox.omnivore.app'
    expect(
      parsedTo({
        envelope: `{"to":["${to}"],"from":"sender@omnivore.app"}`,
      })
    ).to.equal(to)
  })

  it('returns parsed to if envelope does not exists', () => {
    const to = 'receipient@inbox.omnivore.app'
    expect(
      parsedTo({
        to,
      })
    ).to.equal(to)
  })
})

describe('parseAuthor', () => {
  it('returns author if exists', () => {
    const author = 'Tester'
    const address = `${author} <tester@omnivore.app>`
    expect(parseAuthor(address)).to.eql(author)
  })
})

describe('isSubscriptionConfirmationEmail', () => {
  it('returns true if email is a confirmation', () => {
    const subject = 'Confirm your Omnivore newsletter subscription'
    expect(isSubscriptionConfirmationEmail(subject)).to.be.true
  })
})

describe('decode and parse headers', () => {
  it('decodes headers from rfc2047 and parses it', () => {
    const headerStr =
      'Subject: =?UTF-8?B?8J+MjQ==?= Dead on arrival\n' +
      'x-newsletter: =?us-ascii?Q?https=3A=2F=2Farchives=2Einternationalintrigue=2Eio=2Fp=2Fsudan-ceasefires-c?= =?us-ascii?Q?ollapse-fighting-intensifies?=\n'
    const decoded = rfc2047.decode(headerStr)
    expect(decoded).to.eql(
      'Subject: 🌍 Dead on arrival\n' +
        'x-newsletter: https://archives.internationalintrigue.io/p/sudan-ceasefires-collapse-fighting-intensifies\n'
    )
    expect(parseHeaders(decoded)).to.eql({
      subject: '🌍 Dead on arrival',
      'x-newsletter':
        'https://archives.internationalintrigue.io/p/sudan-ceasefires-collapse-fighting-intensifies',
    })
  })
})

describe('plainTextToHtml', () => {
  it('converts text to html', () => {
    const text =
      'DEVOPS WEEKLY\r\n' +
      'ISSUE #665 - 24th September 2023\r\n' +
      '\r\n' +
      'A few posts on CI tooling this week, along with a good introduction to developer portals/platforms and other topics.\r\n' +
      '\r\n' +
      'StackHawk sponsors Devops Weekly\r\n' +
      '============================\r\n' +
      '\r\n' +
      'Experience automated security testing without the hassle of connecting your own app or configuring an environment! Follow the Tutorial to try out StackHawk and explore a world where security becomes an accelerator, not a blocker\r\n' +
      '\r\n' +
      'https://sthwk.com/tutorial\r\n' +
      '\r\n'
    expect(plainTextToHtml(text)).to.eql(
      `<p>DEVOPS WEEKLY
ISSUE #665 - 24th September 2023</p>
<p>A few posts on CI tooling this week, along with a good introduction to developer portals/platforms and other topics.</p>
<h1 id="stackhawksponsorsdevopsweekly">StackHawk sponsors Devops Weekly</h1>
<p>Experience automated security testing without the hassle of connecting your own app or configuring an environment! Follow the Tutorial to try out StackHawk and explore a world where security becomes an accelerator, not a blocker</p>
<p>https://sthwk.com/tutorial</p>`
    )
  })
})
