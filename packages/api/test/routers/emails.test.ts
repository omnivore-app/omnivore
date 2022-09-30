import {
  createTestNewsletterEmail,
  createTestUser,
  deleteTestUser,
} from '../db'
import { User } from '../../src/entity/user'
import 'mocha'
import sinon from 'sinon'
import { expect } from 'chai'
import { request } from '../util'
import * as parser from '../../src/utils/parser'
import * as sendNotification from '../../src/utils/sendNotification'
import * as sendEmail from '../../src/utils/sendEmail'

describe('Emails Router', () => {
  const username = 'fakeUser'
  const newsletterEmail = 'fakeUser@omnivore.app'

  let user: User
  let token: string

  before(async () => {
    // create test user and login
    user = await createTestUser(username)

    await createTestNewsletterEmail(user, newsletterEmail)
    token = process.env.PUBSUB_VERIFICATION_TOKEN!
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
    sinon.restore()
  })

  describe('forward', () => {
    const from = 'from@omnivore.app'
    const to = newsletterEmail
    const subject = 'test subject'
    const html = 'test html'

    beforeEach(async () => {
      sinon.replace(
        sendNotification,
        'sendMulticastPushNotifications',
        sinon.fake.resolves(undefined)
      )
      sinon.replace(sendEmail, 'sendEmail', sinon.fake.resolves(true))
    })

    afterEach(() => {
      sinon.restore()
    })

    context('when email is an article', () => {
      before(() => {
        sinon.replace(parser, 'isProbablyArticle', sinon.fake.resolves(true))
      })

      it('saves the email as an article', async () => {
        const data = {
          message: {
            data: Buffer.from(
              JSON.stringify({ from, to, subject, html })
            ).toString('base64'),
            publishTime: new Date().toISOString(),
          },
        }
        const res = await request
          .post(`/svc/pubsub/emails/forward?token=${token}`)
          .send(data)
          .expect(200)
        expect(res.text).to.eql('Article')
      })
    })

    context('when email is a regular email', () => {
      before(() => {
        sinon.replace(parser, 'isProbablyArticle', sinon.fake.resolves(false))
      })

      it('forwards the email', async () => {
        const data = {
          message: {
            data: Buffer.from(
              JSON.stringify({ from, to, subject, html })
            ).toString('base64'),
            publishTime: new Date().toISOString(),
          },
        }
        const res = await request
          .post(`/svc/pubsub/emails/forward?token=${token}`)
          .send(data)
          .expect(200)
        expect(res.text).to.eql('Email forwarded')
      })
    })
  })
})
