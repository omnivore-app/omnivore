import 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiString from 'chai-string'
import { SubstackHandler } from '../src/newsletters/substack-handler'
import { AxiosHandler } from '../src/newsletters/axios-handler'
import { BloombergNewsletterHandler } from '../src/newsletters/bloomberg-newsletter-handler'
import { GolangHandler } from '../src/newsletters/golang-handler'
import { MorningBrewHandler } from '../src/newsletters/morning-brew-handler'
import nock from 'nock'
import { generateUniqueUrl } from '../src/content-handler'
import fs from 'fs'
import { BeehiivHandler } from '../src/newsletters/beehiiv-handler'

chai.use(chaiAsPromised)
chai.use(chaiString)

const load = (path: string): string => {
  return fs.readFileSync(path, 'utf8')
}

describe('Newsletter email test', () => {
  before(() => {
    nock('https://email.mg2.substack.com')
      .head(
        '/c/eJxNkk2TojAQhn-N3KTyQfg4cGDGchdnYcsZx9K5UCE0EMVAkTiKv36iHnarupNUd7rfVJ4W3EDTj1M89No496Uw0wCxgovuwBgYnbOGsZBVjDHzKPWYU8VehUMWOlIX9Qhw4rKLzXgGZziXnRTcyF7dK0iIGMVOG_OS1aTmKPRDilgVhTQUPCQIcE0x-MFTmJ8rCUpA3KtuenR2urg1ZtAzmszI0tq_Z7m66y-ilQo0uAqMTQ7WRX8auJKg56blZg7WB-iHDuYEBzO6NP0R1IwuYFphQbbTjnTH9NBfs80nym4Zyj8uUvyKbtUyGr5eUz9fNDQ7JCxfJDo9dW1lY9lmj_JNivPbGmf2Pt_lN9tDit9b-WeTetni85Z9pDpVOd7L1E_Vy7egayNO23ZP34eSeLJeux1b0rer_xaZ7ykS78nuSjMY-nL98rparNZNcv07JCjN06_EkTFBxBqOUMACErnELUNMSxTUjLDQZwzcqa4bRjCfeejUEFefS224OLr2S5wxPtij7lVrs80d2CNseRV2P52VNFMBipcdVE-U5jkRD7hFAwpGOylVwU2Mfc9qBh7DoR89yVnWXhgQFHnIsbpVb6tU_B-hH_2yzWY'
      )
      .reply(302, undefined, {
        Location:
          'https://newsletter.slowchinese.net/p/companies-that-eat-people-217',
      })
      .get('/p/companies-that-eat-people-217')
      .reply(200, '')

    nock('https://u23463625.ct.sendgrid.net')
      .head(
        '/ss/c/AX1lEgEQaxtvFxLaVo0GBo_geajNrlI1TGeIcmMViR3pL3fEDZnbbkoeKcaY62QZk0KPFudUiUXc_uMLerV4nA/3k5/3TFZmreTR0qKSCgowABnVg/h30/zzLik7UXd1H_n4oyd5W8Xu639AYQQB2UXz-CsssSnno'
      )
      .reply(302, undefined, {
        Location: 'https://www.milkroad.com/p/talked-guy-spent-30m-beeple',
      })
      .get('/p/talked-guy-spent-30m-beeple')
      .reply(200, '')
  })

  describe('#getNewsletterUrl()', () => {
    it('returns url when email is from SubStack', async () => {
      const rawUrl = '<https://hongbo130.substack.com/p/tldr>'

      await expect(
        new SubstackHandler().parseNewsletterUrl(rawUrl, '')
      ).to.eventually.equal('https://hongbo130.substack.com/p/tldr')
    })

    it('returns url when email is from Axios', async () => {
      const url = 'https://axios.com/blog/the-best-way-to-build-a-web-app'
      const html = `View in browser at <a>${url}</a>`

      await expect(
        new AxiosHandler().parseNewsletterUrl('', html)
      ).to.eventually.equal(url)
    })

    it('returns url when email is from Bloomberg', async () => {
      const url = 'https://www.bloomberg.com/news/google-is-now-a-partner'
      const html = `
        <a class="view-in-browser__url" href="${url}">
        View in browser
        </a>
      `

      await expect(
        new BloombergNewsletterHandler().parseNewsletterUrl('', html)
      ).to.eventually.equal(url)
    })

    it('returns url when email is from Golang Weekly', async () => {
      const url = 'https://www.golangweekly.com/first'
      const html = `
        <a href="${url}" style="text-decoration: none">Read on the Web</a>
      `

      await expect(
        new GolangHandler().parseNewsletterUrl('', html)
      ).to.eventually.equal(url)
    })

    it('returns url when email is from Morning Brew', async () => {
      const url = 'https://www.morningbrew.com/daily/issues/first'
      const html = `
        <a style="color: #000000; text-decoration: none;" target="_blank" rel="noopener" href="${url}">View Online</a>
      `

      await expect(
        new MorningBrewHandler().parseNewsletterUrl('', html)
      ).to.eventually.equal(url)
    })
  })

  describe('get author from email address', () => {
    it('returns author when email is from Substack', () => {
      const from = 'Jackson Harper from Omnivore App <jacksonh@substack.com>'
      expect(new AxiosHandler().parseAuthor(from)).to.equal(
        'Jackson Harper from Omnivore App'
      )
    })

    it('returns author when email is from Axios', () => {
      const from = 'Mike Allen <mike@axios.com>'
      expect(new AxiosHandler().parseAuthor(from)).to.equal('Mike Allen')
    })
  })

  describe('isProbablyNewsletter', () => {
    it('returns true for substack newsletter', async () => {
      const html = load('./test/data/substack-forwarded-newsletter.html')
      await expect(
        new SubstackHandler().isNewsletter({
          html,
          postHeader: '',
          from: '',
          unSubHeader: '',
        })
      ).to.eventually.be.true
    })
    it('returns true for private forwarded substack newsletter', async () => {
      const html = load(
        './test/data/substack-private-forwarded-newsletter.html'
      )
      await expect(
        new SubstackHandler().isNewsletter({
          html,
          postHeader: '',
          from: '',
          unSubHeader: '',
        })
      ).to.eventually.be.true
    })
    it('returns false for substack welcome email', async () => {
      const html = load('./test/data/substack-forwarded-welcome-email.html')
      await expect(
        new SubstackHandler().isNewsletter({
          html,
          postHeader: '',
          from: '',
          unSubHeader: '',
        })
      ).to.eventually.be.false
    })
    it('returns true for beehiiv.com newsletter', async () => {
      const html = load('./test/data/beehiiv-newsletter.html')
      await expect(
        new BeehiivHandler().isNewsletter({
          html,
          postHeader: '',
          from: '',
          unSubHeader: '',
        })
      ).to.eventually.be.true
    })
  })

  describe('findNewsletterUrl', async () => {
    it('gets the URL from the header if it is a substack newsletter', async () => {
      const html = load('./test/data/substack-forwarded-newsletter.html')
      const url = await new SubstackHandler().findNewsletterUrl(html)
      // Not sure if the redirects from substack expire, this test could eventually fail
      expect(url).to.startWith(
        'https://newsletter.slowchinese.net/p/companies-that-eat-people-217'
      )
    })
    it('gets the URL from the header if it is a beehiiv newsletter', async () => {
      const html = load('./test/data/beehiiv-newsletter.html')
      const url = await new BeehiivHandler().findNewsletterUrl(html)
      expect(url).to.startWith(
        'https://www.milkroad.com/p/talked-guy-spent-30m-beeple'
      )
    })
    it('returns undefined if it is not a newsletter', async () => {
      const html = load('./test/data/substack-forwarded-welcome-email.html')
      const url = await new SubstackHandler().findNewsletterUrl(html)
      expect(url).to.be.undefined
    })
  })

  describe('generateUniqueUrl', () => {
    it('generates a unique URL', () => {
      const url1 = generateUniqueUrl()
      const url2 = generateUniqueUrl()

      expect(url1).to.not.eql(url2)
    })
  })
})
