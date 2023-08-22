import 'mocha'
import { expect } from 'chai'
import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { getRepository } from '../../src/entity'
import { ReceivedEmail } from '../../src/entity/received_email'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import sinon from 'sinon'
import * as sendEmail from '../../src/utils/sendEmail'

describe('Recent Emails Resolver', () => {
  const recentEmailsQuery = `
  query {
    recentEmails {
      ... on RecentEmailsSuccess {
        recentEmails {
          id
          from
          to
          subject
          text
          html
        }
      }
      ... on RecentEmailsError {
        errorCodes
      }
    }
  }
`
  let recentEmails: ReceivedEmail[]
  const username = 'fakeUser'

  let user: User
  let authToken: string
  let newsletterEmail: NewsletterEmail
  let newsletterEmail2: NewsletterEmail

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    // create test newsletter email
    newsletterEmail = await getRepository(NewsletterEmail).save({
      user: { id: user.id },
      address: 'fake email address',
    })
    newsletterEmail2 = await getRepository(NewsletterEmail).save({
      user: { id: user.id },
      address: 'fake email address 2',
    })
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
  })

  describe('recentEmails', () => {
    before(async () => {
      // create fake emails
      const recentEmail = await getRepository(ReceivedEmail).save({
        user: { id: user.id },
        from: 'fake from',
        subject: 'fake subject',
        text: 'fake text',
        html: 'fake html',
        to: newsletterEmail.address,
        type: 'article',
      })
      const recentEmail2 = await getRepository(ReceivedEmail).save({
        user: { id: user.id },
        from: 'fake from 2',
        subject: 'fake subject 2',
        text: 'fake text 2',
        html: 'fake html 2',
        to: newsletterEmail2.address,
        type: 'non-article',
      })
      recentEmails = [recentEmail, recentEmail2]
    })

    it('returns recent emails', async () => {
      const res = await graphqlRequest(recentEmailsQuery, authToken).expect(200)
      const { recentEmails: results } = res.body.data.recentEmails

      expect(results).to.have.lengthOf(2)
      expect(results[0].id).to.eql(recentEmails[1].id)
      expect(results[1].id).to.eql(recentEmails[0].id)
    })
  })

  describe('markEmailAsItem', () => {
    const markEmailAsItemMutation = (recentEmailId: string) => `
      mutation {
        markEmailAsItem(recentEmailId: "${recentEmailId}") {
          ... on MarkEmailAsItemSuccess {
            success
          }
          ... on MarkEmailAsItemError {
            errorCodes
          }
        }
      }
    `

    let recentEmail: ReceivedEmail

    before(async () => {
      // create fake email
      recentEmail = await getRepository(ReceivedEmail).save({
        user: { id: user.id },
        from: 'Omnivore Newsletter <newsletter@omnivore.app>',
        subject: 'fake subject 3',
        text: 'fake text 3',
        html: '<html><body>fake html 3</body></html>',
        to: newsletterEmail.address,
        type: 'non-article',
      })
      sinon.replace(sendEmail, 'sendEmail', sinon.fake.resolves(true))
    })

    after(async () => {
      // clean up
      await getRepository(ReceivedEmail).delete(recentEmail.id)
      sinon.restore()
    })

    it('marks email as item', async () => {
      const resp = await graphqlRequest(
        markEmailAsItemMutation(recentEmail.id),
        authToken
      )

      expect(resp.body.data.markEmailAsItem.success).to.be.true

      const updatedRecentEmail = await getRepository(ReceivedEmail).findOneBy({
        id: recentEmail.id,
      })
      expect(updatedRecentEmail?.type).to.eql('article')
    })
  })

  describe('old recentEmails are cleared', () => {
    let user2: User
    let user3: User
    let user2Auth: string

    before(async () => {
      user2 = await createTestUser('fake_02')
      user3 = await createTestUser('fake_03')
      const res = await request
        .post('/local/debug/fake-user-login')
        .send({ fakeEmail: user2.email })

      user2Auth = res.body.authToken
    })
    after(async () => {
      await deleteTestUser(user2.id)
      await deleteTestUser(user3.id)
    })

    before(async () => {
      // create fake emails
      const recentEmail = await getRepository(ReceivedEmail).save({
        user: { id: user2.id },
        from: 'fake from',
        subject: 'fake subject',
        text: 'fake text',
        html: 'fake html',
        to: newsletterEmail.address,
        type: 'article',
      })
      const recentEmail2 = await getRepository(ReceivedEmail).save({
        user: { id: user2.id },
        from: 'fake from 2',
        subject: 'fake subject 2',
        text: 'fake text 2',
        html: 'fake html 2',
        to: newsletterEmail2.address,
        type: 'non-article',
      })
      recentEmails = [recentEmail, recentEmail2]
    })

    it('when a second user receives an email the firsts are not deleted', async () => {
      const res = await graphqlRequest(recentEmailsQuery, user2Auth).expect(200)
      const { recentEmails: results } = res.body.data.recentEmails

      expect(results).to.have.lengthOf(2)
      expect(results[0].id).to.eql(recentEmails[1].id)
      expect(results[1].id).to.eql(recentEmails[0].id)

      await getRepository(ReceivedEmail).save({
        user: { id: user3.id },
        from: 'fake from',
        subject: 'fake subject',
        text: 'fake text',
        html: 'fake html',
        to: newsletterEmail.address,
        type: 'article',
      })

      const res2 = await graphqlRequest(recentEmailsQuery, user2Auth).expect(
        200
      )
      const { recentEmails: results2 } = res2.body.data.recentEmails

      expect(results2).to.have.lengthOf(2)
      expect(results2[0].id).to.eql(recentEmails[1].id)
      expect(results2[1].id).to.eql(recentEmails[0].id)
    })
  })
})
