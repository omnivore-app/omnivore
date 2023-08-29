import chai, { expect } from 'chai'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { Subscription } from '../../src/entity/subscription'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/entity/utils'
import {
  SubscriptionStatus,
  SubscriptionType,
} from '../../src/generated/graphql'
import { UNSUBSCRIBE_EMAIL_TEXT } from '../../src/services/subscriptions'
import * as sendEmail from '../../src/utils/sendEmail'
import { createTestSubscription, createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'

chai.use(sinonChai)

describe('Subscriptions API', () => {
  let user: User
  let authToken: string
  let subscriptions: Subscription[]

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    // create test newsletter subscriptions
    const newsletterEmail = await getRepository(NewsletterEmail).save({
      user,
      address: 'test@inbox.omnivore.app',
      confirmationCode: 'test',
    })

    //  create testing newsletter subscriptions
    const sub1 = await createTestSubscription(user, 'sub_1', newsletterEmail)
    const sub2 = await createTestSubscription(user, 'sub_2', newsletterEmail)
    // create a unsubscribed subscription
    await createTestSubscription(
      user,
      'sub_3',
      newsletterEmail,
      SubscriptionStatus.Unsubscribed
    )
    // create an rss feed subscription
    const sub4 = await createTestSubscription(
      user,
      'sub_4',
      undefined,
      SubscriptionStatus.Active,
      undefined,
      SubscriptionType.Rss
    )
    subscriptions = [sub4, sub2, sub1]
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
  })

  describe('GET subscriptions', () => {
    let query: string

    beforeEach(() => {
      query = `
        query {
          subscriptions {
            ... on SubscriptionsSuccess {
              subscriptions {
                id
                name
              }
            }
            ... on SubscriptionsError {
              errorCodes
            }
          }
        }
      `
    })

    it('should return subscriptions', async () => {
      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.subscriptions.subscriptions).to.eql(
        subscriptions.map((sub) => ({
          id: sub.id,
          name: sub.name,
        }))
      )
    })

    it('should return only newsletters when type newsletter supplied', async () => {
      query = `
        query {
          subscriptions(type: NEWSLETTER) {
            ... on SubscriptionsSuccess {
              subscriptions {
                id
                name
              }
            }
            ... on SubscriptionsError {
              errorCodes
            }
          }
        }
      `
      const newsletters = subscriptions.filter(
        (s) => s.type == SubscriptionType.Newsletter
      )
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.subscriptions.subscriptions).to.eql(
        newsletters.map((sub) => ({
          id: sub.id,
          name: sub.name,
        }))
      )
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        query {
          subscriptions {}
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })

  describe('Unsubscribe', () => {
    const query = (name: string) => `
      mutation {
        unsubscribe(name: "${name}") {
          ... on UnsubscribeSuccess {
            subscription {
              id
            }
          }
          ... on UnsubscribeError {
            errorCodes
          }
        }
      }
    `

    it('unsubscribes', async () => {
      const name = 'Sub_5'
      const to = 'unsubscribe@omnivore.app'
      const subject = 'test'
      // create test newsletter subscriptions
      const newsletterEmail = await getRepository(NewsletterEmail).save({
        user,
        address: 'test_2@inbox.omnivore.app',
        confirmationCode: 'test',
      })
      const subscription = await createTestSubscription(
        user,
        name,
        newsletterEmail,
        SubscriptionStatus.Active,
        `${to}?subject=${subject}`
      )

      // fake sendEmail function
      const fake = sinon.replace(
        sendEmail,
        'sendEmail',
        sinon.fake.resolves(true)
      )

      const res = await graphqlRequest(query(name), authToken).expect(200)

      expect(res.body.data.unsubscribe.subscription).to.eql({
        id: subscription.id,
      })

      const deletedSubscription = await getRepository(Subscription).findOneBy({
        id: subscription.id,
      })
      expect(deletedSubscription).to.be.null

      // check if the email was sent
      expect(fake).to.have.been.calledOnceWith({
        to,
        subject,
        text: UNSUBSCRIBE_EMAIL_TEXT,
        from: newsletterEmail.address,
      })

      sinon.restore()
    })
  })
})
