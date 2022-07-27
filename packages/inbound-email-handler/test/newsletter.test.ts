import { expect } from 'chai'
import {
  getConfirmationCode,
  isConfirmationEmail,
  NewsletterHandler,
  parseUnsubscribe,
} from '../src/newsletter'
import { SubstackHandler } from '../src/substack-handler'
import { AxiosHandler } from '../src/axios-handler'
import { BloombergHandler } from '../src/bloomberg-handler'
import { GolangHandler } from '../src/golang-handler'
import { getNewsletterHandler } from '../src'
import { MorningBrewHandler } from '../src/morning-brew-handler'

describe('Confirmation email test', () => {
  describe('#isConfirmationEmail()', () => {
    it('returns true when email is from Gmail Team', () => {
      const from = 'Gmail Team <forwarding-noreply@google.com>'

      expect(isConfirmationEmail(from)).to.be.true
    })
  })

  describe('#getConfirmationCode()', () => {
    it('returns the confirmation code from the email', () => {
      const code = '593781109'
      const subject = `(#${code}) Gmail Forwarding Confirmation - Receive Mail from sam@omnivore.com`

      expect(getConfirmationCode(subject)).to.equal(code)
    })
  })
})

describe('Newsletter email test', () => {
  describe('#getNewsletterHandler()', () => {
    it('returns SubstackHandler when email is from SubStack', () => {
      const rawUrl = '<https://hongbo130.substack.com/p/tldr>'

      expect(getNewsletterHandler(rawUrl, '', '')).to.be.instanceof(
        SubstackHandler
      )
    })

    it('returns AxiosHandler when email is from Axios', () => {
      const from = 'Mike Allen <mike@axios.com>'
      const unSubRawUrl =
        '<https://axios.com/unsubscribe?email=mike%40axios.com&code=593781109>'

      expect(getNewsletterHandler('', from, unSubRawUrl)).to.be.instanceof(
        AxiosHandler
      )
    })

    context('when email is from Bloomberg', () => {
      it('should return BloombergHandler when email is from Bloomberg Business', () => {
        const from = 'From: Bloomberg <noreply@mail.bloombergbusiness.com>'
        const unSubRawUrl = '<https://bloomberg.com/unsubscribe>'

        expect(getNewsletterHandler('', from, unSubRawUrl)).to.be.instanceof(
          BloombergHandler
        )
      })

      it('should return BloombergHandler when email is from Bloomberg View', () => {
        const from = 'From: Bloomberg <noreply@mail.bloombergview.com>'
        const unSubRawUrl = '<https://bloomberg.com/unsubscribe>'

        expect(getNewsletterHandler('', from, unSubRawUrl)).to.be.instanceof(
          BloombergHandler
        )
      })
    })

    it('should return GolangHandler when email is from Golang Weekly', () => {
      const from = 'Golang Weekly <peter@golangweekly.com>'
      const unSubRawUrl = '<https://golangweekly.com/unsubscribe>'

      expect(getNewsletterHandler('', from, unSubRawUrl)).to.be.instanceof(
        GolangHandler
      )
    })

    it('should return MorningBrewHandler when email is from Morning Brew', () => {
      const from = 'Morning Brew <crew@morningbrew.com>'
      const unSubRawUrl = '<https://morningbrew.com/unsubscribe>'

      expect(getNewsletterHandler('', from, unSubRawUrl)).to.be.instanceof(
        MorningBrewHandler
      )
    })
  })

  describe('#getNewsletterUrl()', () => {
    it('returns url when email is from SubStack', () => {
      const rawUrl = '<https://hongbo130.substack.com/p/tldr>'

      expect(new SubstackHandler().parseNewsletterUrl(rawUrl, '')).to.equal(
        'https://hongbo130.substack.com/p/tldr'
      )
    })

    it('returns url when email is from Axios', () => {
      const url = 'https://axios.com/blog/the-best-way-to-build-a-web-app'
      const html = `View in browser at <a>${url}</a>`

      expect(new AxiosHandler().parseNewsletterUrl('', html)).to.equal(url)
    })

    it('returns url when email is from Bloomberg', () => {
      const url = 'https://www.bloomberg.com/news/google-is-now-a-partner'
      const html = `
        <a class="view-in-browser__url" href="${url}">
        View in browser
        </a>
      `

      expect(new BloombergHandler().parseNewsletterUrl('', html)).to.equal(url)
    })

    it('returns url when email is from Golang Weekly', () => {
      const url = 'https://www.golangweekly.com/first'
      const html = `
        <a href="${url}" style="text-decoration: none">Read on the Web</a>
      `

      expect(new GolangHandler().parseNewsletterUrl('', html)).to.equal(url)
    })

    it('returns url when email is from Morning Brew', () => {
      const url = 'https://www.morningbrew.com/daily/issues/first'
      const html = `
        <a style="color: #000000; text-decoration: none;" target="_blank" rel="noopener" href="${url}">View Online</a>
      `

      expect(new MorningBrewHandler().parseNewsletterUrl('', html)).to.equal(
        url
      )
    })
  })

  describe('get author from email address', () => {
    it('returns author when email is from Substack', () => {
      const from = 'Jackson Harper from Omnivore App <jacksonh@substack.com>'
      expect(new NewsletterHandler().parseAuthor(from)).to.equal(
        'Jackson Harper from Omnivore App'
      )
    })

    it('returns author when email is from Axios', () => {
      const from = 'Mike Allen <mike@axios.com>'
      expect(new NewsletterHandler().parseAuthor(from)).to.equal('Mike Allen')
    })
  })

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
