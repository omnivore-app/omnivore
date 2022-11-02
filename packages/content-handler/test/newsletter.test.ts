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
import { ConvertkitHandler } from '../src/newsletters/convertkit-handler'
import { GhostHandler } from '../src/newsletters/ghost-handler'
import { CooperPressHandler } from '../src/newsletters/cooper-press-handler'
import { getNewsletterHandler } from '../src'
import { parseHTML } from 'linkedom'
import { HeyWorldHandler } from '../src/newsletters/hey-world-handler'

chai.use(chaiAsPromised)
chai.use(chaiString)

const load = (path: string): string => {
  return fs.readFileSync(path, 'utf8')
}

describe('Newsletter email test', () => {
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

  describe('getNewsletterHandler', () => {
    it('returns substack newsletter handler', async () => {
      const html = load('./test/data/substack-forwarded-newsletter.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(SubstackHandler)
    })

    it('returns SubstackHandler for private forwarded substack newsletter', async () => {
      const html = load(
        './test/data/substack-private-forwarded-newsletter.html'
      )
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(SubstackHandler)
    })

    it('returns undefined for substack welcome email', async () => {
      const html = load('./test/data/substack-forwarded-welcome-email.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.undefined
    })

    it('returns SubstackHandler for substack newsletter with static tweets', async () => {
      const html = load(
        './test/data/substack-with-static-tweets-newsletter.html'
      )
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(SubstackHandler)
    })

    it('fixes up static tweets in Substack newsletters', async () => {
      const url =
        'https://astralcodexten.substack.com/p/nick-cammarata-on-jhana'
      const html = load(
        './test/data/substack-with-static-tweets-newsletter.html'
      )
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(SubstackHandler)

      const dom = parseHTML(html).document
      expect(handler?.shouldPreParse(url, dom)).to.be.true

      const preparsed = await handler?.preParse(url, dom)
      const tweets = Array.from(
        preparsed?.querySelectorAll('div[class="_omnivore-static-tweet"]') ?? []
      )

      expect(tweets.length).to.eq(7)
    })

    it('returns BeehiivHandler for beehiiv.com newsletter', async () => {
      const html = load('./test/data/beehiiv-newsletter.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(BeehiivHandler)
    })

    it('returns BeehiivHandler for milkroad newsletter', async () => {
      const html = load('./test/data/milkroad-newsletter.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(BeehiivHandler)
    })

    it('returns GhostHandler for ghost newsletter', async () => {
      const html = load('./test/data/ghost-newsletter.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(GhostHandler)
    })

    it('returns ConvertkitHandler for convertkit newsletter', async () => {
      const html = load('./test/data/convertkit-newsletter.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(ConvertkitHandler)
    })

    it('returns CooperPressHandler for node-weekly newsletter', async () => {
      const html = load('./test/data/node-weekly-newsletter.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(CooperPressHandler)
    })

    it('returns HeyWorldHandler for hey world newsletter', async () => {
      const html = load('./test/data/hey-world-newsletter.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: 'Hongbo Wu <hw@world.hey.com>',
        unSubHeader:
          '<https://world.hey.com/dhh/subscribers/MtuoW9TvSJK9o5c7ohB72V2s/unsubscribe>',
      })
      expect(handler).to.be.instanceOf(HeyWorldHandler)
    })

    it('returns ConvertkitHandler for Tomasz Tunguz newsletter', async () => {
      const html = load('./test/data/tomasz-tunguz-newsletter.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.instanceOf(ConvertkitHandler)
    })

    it('returns undefined for convertkit confirmation email', async () => {
      const html = load('./test/data/convertkit-confirmation.html')
      const handler = await getNewsletterHandler({
        html,
        postHeader: '',
        from: '',
        unSubHeader: '',
      })
      expect(handler).to.be.undefined
    })
  })

  describe('findNewsletterUrl', async () => {
    context('when email is from Substack', () => {
      before(() => {
        nock('https://email.mg2.substack.com')
          .head(
            '/c/eJxNkk2TojAQhn-N3KTyQfg4cGDGchdnYcsZx9K5UCE0EMVAkTiKv36iHnarupNUd7rfVJ4W3EDTj1M89No496Uw0wCxgovuwBgYnbOGsZBVjDHzKPWYU8VehUMWOlIX9Qhw4rKLzXgGZziXnRTcyF7dK0iIGMVOG_OS1aTmKPRDilgVhTQUPCQIcE0x-MFTmJ8rCUpA3KtuenR2urg1ZtAzmszI0tq_Z7m66y-ilQo0uAqMTQ7WRX8auJKg56blZg7WB-iHDuYEBzO6NP0R1IwuYFphQbbTjnTH9NBfs80nym4Zyj8uUvyKbtUyGr5eUz9fNDQ7JCxfJDo9dW1lY9lmj_JNivPbGmf2Pt_lN9tDit9b-WeTetni85Z9pDpVOd7L1E_Vy7egayNO23ZP34eSeLJeux1b0rer_xaZ7ykS78nuSjMY-nL98rparNZNcv07JCjN06_EkTFBxBqOUMACErnELUNMSxTUjLDQZwzcqa4bRjCfeejUEFefS224OLr2S5wxPtij7lVrs80d2CNseRV2P52VNFMBipcdVE-U5jkRD7hFAwpGOylVwU2Mfc9qBh7DoR89yVnWXhgQFHnIsbpVb6tU_B-hH_2yzWY'
          )
          .reply(301, undefined, {
            Location:
              'https://newsletter.slowchinese.net/p/companies-that-eat-people-217',
          })
        nock('https://newsletter.slowchinese.net')
          .head('/p/companies-that-eat-people-217')
          .reply(200, '')
      })

      it('gets the URL from the header', async () => {
        const html = load('./test/data/substack-forwarded-newsletter.html')
        const url = await new SubstackHandler().findNewsletterUrl(html)
        // Not sure if the redirects from substack expire, this test could eventually fail
        expect(url).to.startWith(
          'https://newsletter.slowchinese.net/p/companies-that-eat-people-217'
        )
      })
    })

    context('when email is from beehiiv', () => {
      before(() => {
        nock('https://u23463625.ct.sendgrid.net')
          .head(
            '/ss/c/AX1lEgEQaxtvFxLaVo0GBo_geajNrlI1TGeIcmMViR3pL3fEDZnbbkoeKcaY62QZk0KPFudUiUXc_uMLerV4nA/3k5/3TFZmreTR0qKSCgowABnVg/h30/zzLik7UXd1H_n4oyd5W8Xu639AYQQB2UXz-CsssSnno'
          )
          .reply(301, undefined, {
            Location: 'https://www.milkroad.com/p/talked-guy-spent-30m-beeple',
          })
        nock('https://www.milkroad.com')
          .head('/p/talked-guy-spent-30m-beeple')
          .reply(200, '')
      })

      it('gets the URL from the header', async () => {
        const html = load('./test/data/beehiiv-newsletter.html')
        const url = await new BeehiivHandler().findNewsletterUrl(html)
        expect(url).to.startWith(
          'https://www.milkroad.com/p/talked-guy-spent-30m-beeple'
        )
      })
    })

    context('when email is from convertkit', () => {
      before(() => {
        nock('https://u25184427.ct.sendgrid.net')
          .head(
            '/ls/click?upn=MnmHBiCwIPe9TmIJeskmA7wDTJvdVU1ACmSJ753YuhScf71JWthxqM8RnVh-2FZG0rYzrbR04P99S2ld2OkTtQmrx2FDwArpYdk5N0jVpN9dLBZ-2BdPNqkRHxNvuygY8-2F-2FtRNFoPjxjtTuyWM6L3tcYDYnAnL2xCueddWcFlUNrQWsvLotmgvC-2BrQc7bxsZhW0pUBmS_vVXscVLXlj5UtQe3aqo5RMTdTq2PepdZjP86UOmA8nzSBnnaDN-2FNHWDodWnbUOPZ063v3w3z8QtcaPpE1qNu8xYkNJJFb-2F1uZEG-2BzsLfyDkjvvVX5zYs5OyyRYlhMOlXDJcr4-2FtMrFwii0uFAvwbhxDdnTxEpi-2F7maufyH39AEO-2BtCeSUg5V4FM43UpI1zUSXeWK-2Fh5JumSmR5XhrrRAig-3D-3D'
          )
          .reply(301, undefined, {
            Location: 'https://fs.blog/brain-food/october-16-2022/',
          })
        nock('https://fs.blog')
          .head('/brain-food/october-16-2022/')
          .reply(200, '')
      })

      it('gets the URL from the header', async () => {
        const html = load('./test/data/convertkit-newsletter.html')
        const url = await new ConvertkitHandler().findNewsletterUrl(html)
        expect(url).to.startWith('https://fs.blog/brain-food/october-16-2022/')
      })
    })

    it('returns undefined if it is not a newsletter', async () => {
      const html = load('./test/data/substack-forwarded-welcome-email.html')
      const url = await new SubstackHandler().findNewsletterUrl(html)
      expect(url).to.be.undefined
    })

    context('when email is from ghost', () => {
      before(() => {
        nock('https://u25184427.ct.sendgrid.net')
          .head(
            '/ls/click?upn=MnmHBiCwIPe9TmIJeskmA9nRLefEmmgrd5xWS-2Bc39wxPBpwDRny1FmWt1H0FpgKAz1dv_vVXscVLXlj5UtQe3aqo5RMTdTq2PepdZjP86UOmA8nzulL-2F3YyC-2FHgJV0JnOPtjNvgjHSaQVfisQ15hPQtnlo4t73zgTQL4QnDoer4qJ3-2F2Lf-2F2ElFMF3NyoUD4eqWCWwUM0w4P9Feaeo-2BolkySAB611BySXRt6V3Z-2F7mQcpcRX3D9zV-2B-2FdRY0Vn30aR-2BKY8qpTFuivxzF19UkQGjK5srg-3D-3D'
          )
          .reply(301, undefined, {
            Location: 'https://www.openml.fyi/2022-10-14/',
          })
        nock('https://www.openml.fyi').head('/2022-10-14/').reply(200, '')
      })

      it('gets the URL from the header', async () => {
        const html = load('./test/data/ghost-newsletter.html')
        const url = await new GhostHandler().findNewsletterUrl(html)
        expect(url).to.startWith('https://www.openml.fyi/2022-10-14/')
      })
    })

    context('when email is from cooper press', () => {
      before(() => {
        nock('https://u25184427.ct.sendgrid.net')
          .head(
            '/ls/click?upn=MnmHBiCwIPe9TmIJeskmA7mFdqmsIs-2B5Xs-2FNpSIs56obSPDXnoBEjufvIqRCEJUf5Uqg_vVXscVLXlj5UtQe3aqo5RMTdTq2PepdZjP86UOmA8nyFE700vlj1-2FK27spZiPEiEkDU3SIXWGeoiU60KFhM-2B-2Bxx5yiL8KKbAV6oFceRi8O1gMc3mdwg5D8FaaM3PublaX24iAcVbn99PzxJaPuVrU6xDWbRovw2UgGTIoEI-2BBO-2B0qzi2wv5c6yJTkUGZOcsJ6xGLXO1BO-2BHSbyZMZV4NMw-3D-3D'
          )
          .reply(301, undefined, {
            Location: 'https://nodeweekly.com/issues/459',
          })
        nock('https://nodeweekly.com').head('/issues/459').reply(200, '')
      })

      it('gets the URL from the header', async () => {
        const html = load('./test/data/node-weekly-newsletter.html')
        const url = await new CooperPressHandler().findNewsletterUrl(html)
        expect(url).to.startWith('https://nodeweekly.com/issues/459')
      })
    })

    context('when email is from hey world', () => {
      before(() => {
        nock('https://world.hey.com')
          .head('/dhh/here-s-how-to-fix-twitter-79632ecb')
          .reply(200, '')
      })

      it('gets the URL from the header', async () => {
        const html = load('./test/data/hey-world-newsletter.html')
        const url = await new HeyWorldHandler().findNewsletterUrl(html)
        expect(url).to.startWith(
          'https://world.hey.com/dhh/here-s-how-to-fix-twitter-79632ecb'
        )
      })
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
