import { expect } from 'chai'
import 'mocha'
import sinon from 'sinon'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { ReceivedEmail } from '../../src/entity/received_email'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/repository'
import {
  deleteReceivedEmail,
  findReceivedEmailById,
  saveReceivedEmail,
} from '../../src/services/received_emails'
import { deleteUser } from '../../src/services/user'
import * as sendEmail from '../../src/utils/sendEmail'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

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
    await deleteUser(user.id)
  })

  describe('recentEmails', () => {
    before(async () => {
      // create fake emails
      const recentEmail = await saveReceivedEmail(
        'fake from',
        newsletterEmail.address,
        'fake subject',
        'fake text',
        'fake html',
        user.id,
        'article'
      )
      const recentEmail2 = await saveReceivedEmail(
        'fake from 2',
        newsletterEmail2.address,
        'fake subject 2',
        'fake text 2',
        'fake html 2',
        user.id,
        'non-article'
      )
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
      recentEmail = await saveReceivedEmail(
        'Omnivore Newsletter <newsletter@omnivore.app>',
        newsletterEmail.address,
        'fake subject 3',
        'fake text 3',
        'fake html 3',
        user.id,
        'non-article'
      )
      sinon.replace(sendEmail, 'sendEmail', sinon.fake.resolves(true))
    })

    after(async () => {
      // clean up
      await deleteReceivedEmail(recentEmail.id, user.id)
      sinon.restore()
    })

    it('marks email as item', async () => {
      const resp = await graphqlRequest(
        markEmailAsItemMutation(recentEmail.id),
        authToken
      )

      expect(resp.body.data.markEmailAsItem.success).to.be.true

      const updatedRecentEmail = await findReceivedEmailById(
        recentEmail.id,
        user.id
      )
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
      await deleteUser(user2.id)
      await deleteUser(user3.id)
    })

    before(async () => {
      // create fake emails
      const recentEmail = await saveReceivedEmail(
        'fake from 4',
        newsletterEmail.address,
        'fake subject 4',
        'fake text 4',
        'fake html 4',
        user2.id,
        'article'
      )

      const recentEmail2 = await saveReceivedEmail(
        'fake from 4',
        newsletterEmail.address,
        'fake subject 4',
        'fake text 4',
        'fake html 4',
        user2.id,
        'non-article'
      )

      recentEmails = [recentEmail, recentEmail2]
    })

    it('when a second user receives an email the firsts are not deleted', async () => {
      const res = await graphqlRequest(recentEmailsQuery, user2Auth).expect(200)
      const { recentEmails: results } = res.body.data.recentEmails

      expect(results).to.have.lengthOf(2)
      expect(results[0].id).to.eql(recentEmails[1].id)
      expect(results[1].id).to.eql(recentEmails[0].id)

      await saveReceivedEmail(
        'fake from 5',
        newsletterEmail.address,
        'fake subject 5',
        'fake text 5',
        'fake html 5',
        user3.id,
        'article'
      )

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
