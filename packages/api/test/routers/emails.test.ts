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
import { getRepository } from '../../src/entity'
import { ReceivedEmail } from '../../src/entity/received_email'
import * as jwt from 'jsonwebtoken'

describe('Emails Router', () => {
  const newsletterEmail = 'fakeUser@omnivore.app'
  const from = 'fake from'
  const subject = 'fake subject'
  const text = 'fake text'
  const to = newsletterEmail

  let user: User
  let token: string
  let receivedEmail: ReceivedEmail

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')

    await createTestNewsletterEmail(user, newsletterEmail)
    token = process.env.PUBSUB_VERIFICATION_TOKEN!
    receivedEmail = await getRepository(ReceivedEmail).save({
      user: { id: user.id },
      from,
      to,
      subject,
      text,
      html: '',
      type: 'non-article',
    })
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
    sinon.restore()
  })

  describe('forward', () => {
    const html = '<html>test html</html>'

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
              JSON.stringify({
                from,
                to,
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
                to,
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
    const authToken = jwt.sign(newsletterEmail, process.env.JWT_SECRET || '')

    it('saves the email in the database', async () => {
      const data = {
        html,
        text,
        from,
        to: newsletterEmail,
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
        to: newsletterEmail,
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
        to: newsletterEmail,
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
