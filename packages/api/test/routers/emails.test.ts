import { expect } from 'chai'
import * as jwt from 'jsonwebtoken'
import 'mocha'
import sinon from 'sinon'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { ReceivedEmail } from '../../src/entity/received_email'
import { User } from '../../src/entity/user'
import { createNewsletterEmail } from '../../src/services/newsletters'
import { saveReceivedEmail } from '../../src/services/received_emails'
import { deleteUser } from '../../src/services/user'
import * as parser from '../../src/utils/parser'
import * as sendEmail from '../../src/utils/sendEmail'
import * as sendNotification from '../../src/utils/sendNotification'
import { createTestUser } from '../db'
import { request } from '../util'

describe('Emails Router', () => {
  const from = 'fake from'
  const subject = 'fake subject'
  const text = 'fake text'

  let user: User
  let token: string
  let receivedEmail: ReceivedEmail
  let newsletterEmail: NewsletterEmail
  let authToken: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')

    newsletterEmail = await createNewsletterEmail(user.id)
    token = process.env.PUBSUB_VERIFICATION_TOKEN || ''
    receivedEmail = await saveReceivedEmail(
      from,
      newsletterEmail.address,
      subject,
      text,
      '',
      user.id,
      'non-article'
    )
    authToken = jwt.sign(user.id, process.env.JWT_SECRET || '')
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
    sinon.restore()
  })

  describe('forward', () => {
    const html = '<html>test html</html>'

    beforeEach(() => {
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
              JSON.stringify({
                from,
                to: newsletterEmail.address,
                subject,
                html,
                text,
                receivedEmailId: receivedEmail.id,
              })
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
              JSON.stringify({
                from,
                to: newsletterEmail.address,
                subject,
                html,
                text,
                receivedEmailId: receivedEmail.id,
              })
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

  describe('create', () => {
    const url = '/svc/pubsub/emails/save'
    const html = '<html>test html</html>'
    const text = 'test text'
    const from = 'fake from'
    const subject = 'fake subject'

    it('saves the email in the database', async () => {
      const data = {
        html,
        text,
        from,
        to: newsletterEmail.address,
        subject,
      }
      const res = await request
        .post(url)
        .set('Authorization', `${authToken}`)
        .send(data)
        .expect(200)

      expect(res.body.id).not.to.be.undefined
    })

    it('saves the email if body is empty', async () => {
      const data = {
        from,
        to: newsletterEmail.address,
        subject,
      }
      const res = await request
        .post(url)
        .set('Authorization', `${authToken}`)
        .send(data)
        .expect(200)

      expect(res.body.id).not.to.be.undefined
    })

    it('saves the email if subject is empty', async () => {
      const data = {
        from,
        to: newsletterEmail.address,
        html,
      }
      const res = await request
        .post(url)
        .set('Authorization', `${authToken}`)
        .send(data)
        .expect(200)

      expect(res.body.id).not.to.be.undefined
    })
  })
})
