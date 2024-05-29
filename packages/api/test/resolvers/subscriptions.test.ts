import chai, { expect } from 'chai'
import 'mocha'
import Parser from 'rss-parser'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { Subscription } from '../../src/entity/subscription'
import { User } from '../../src/entity/user'
import {
  SubscriptionStatus,
  SubscriptionType,
} from '../../src/generated/graphql'
import { getRepository } from '../../src/repository'
import { createNewsletterEmail } from '../../src/services/newsletters'
import {
  createSubscription,
  deleteSubscription,
  UNSUBSCRIBE_EMAIL_TEXT,
} from '../../src/services/subscriptions'
import { deleteUser } from '../../src/services/user'
import * as sendEmail from '../../src/utils/sendEmail'
import { createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

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

    authToken = res.body.authToken as string

    // create test newsletter subscriptions
    const newsletterEmail = await createNewsletterEmail(user.id)

    //  create testing newsletter subscriptions
    const sub1 = await createSubscription(user.id, 'sub_1', newsletterEmail)
    const sub2 = await createSubscription(user.id, 'sub_2', newsletterEmail)
    // create a unsubscribed subscription
    await createSubscription(
      user.id,
      'sub_3',
      newsletterEmail,
      SubscriptionStatus.Unsubscribed
    )
    // create an rss feed subscription
    const sub4 = await createSubscription(
      user.id,
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
    await deleteUser(user.id)
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

    it('should not return inactive newsletters but should return inactive RSS', async () => {
      const sub5 = await createSubscription(
        user.id,
        'sub_5',
        undefined,
        SubscriptionStatus.Unsubscribed,
        undefined,
        SubscriptionType.Rss
      )

      try {
        await createSubscription(
          user.id,
          'sub_6',
          undefined,
          SubscriptionStatus.Unsubscribed,
          undefined,
          SubscriptionType.Newsletter
        )
        const allSubscriptions = [...subscriptions, sub5]
        const res = await graphqlRequest(query, authToken).expect(200)

        expect(res.body.data.subscriptions.subscriptions).to.eql(
          allSubscriptions.map((sub) => ({
            id: sub.id,
            name: sub.name,
          }))
        )
      } finally {
        await getRepository(Subscription).remove(sub5)
      }
    })

    it('should not return other users subscriptions', async () => {
      // create test user and login
      const user2 = await createTestUser('fakeUser2')
      try {
        await createSubscription(
          user2.id,
          'sub_other',
          undefined,
          SubscriptionStatus.Unsubscribed,
          undefined,
          SubscriptionType.Rss
        )
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.subscriptions.subscriptions).to.eql(
          subscriptions.map((sub) => ({
            id: sub.id,
            name: sub.name,
          }))
        )
      } finally {
        await deleteUser(user2.id)
      }
    })

    it('should not return other users subscriptions when type is set to RSS', async () => {
      query = `
      query {
        subscriptions(type: RSS) {
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
      const user3 = await createTestUser('fakeUser3')
      try {
        await createSubscription(
          user3.id,
          'sub_other',
          undefined,
          SubscriptionStatus.Unsubscribed,
          undefined,
          SubscriptionType.Rss
        )
        const rssItems = subscriptions.filter(
          (s) => s.type == SubscriptionType.Rss
        )
        const res = await graphqlRequest(query, authToken).expect(200)
        expect(res.body.data.subscriptions.subscriptions).to.eql(
          rssItems.map((sub) => ({
            id: sub.id,
            name: sub.name,
          }))
        )
      } finally {
        await deleteUser(user3.id)
      }
    })

    it('should not return other users subscriptions when type is set to NEWSLETTER', async () => {
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
      const user2 = await createTestUser('fakeUser2')
      try {
        await createSubscription(
          user2.id,
          'sub_other',
          undefined,
          SubscriptionStatus.Unsubscribed,
          undefined,
          SubscriptionType.Rss
        )
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
      } finally {
        await deleteUser(user2.id)
      }
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
      const subscription = await createSubscription(
        user.id,
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

      const updatedSubscription = await getRepository(Subscription).findOneBy({
        id: subscription.id,
      })
      expect(updatedSubscription?.status).to.eql(
        SubscriptionStatus.Unsubscribed
      )

      // check if the email was sent
      expect(fake).to.have.been.calledOnceWith({
        to,
        subject,
        text: UNSUBSCRIBE_EMAIL_TEXT,
        from: newsletterEmail.address,
      })

      sinon.restore()

      // clean up
      await getRepository(Subscription).remove(subscription)
    })
  })

  describe('Subscribe API', () => {
    const query = `
      mutation Subscribe($input: SubscribeInput!){
        subscribe(input: $input) {
          ... on SubscribeSuccess {
            subscriptions {
              id
              createdAt
            }
          }
          ... on SubscribeError {
            errorCodes
          }
        }
      }
    `

    context('when subscribing to a rss feed', () => {
      const url = 'https://www.omnivore.app/rss'
      const subscriptionType = SubscriptionType.Rss

      before(() => {
        // fake rss parser
        sinon.replace(
          Parser.prototype,
          'parseURL',
          sinon.fake.resolves({
            title: 'RSS Feed',
            description: 'RSS Feed Description',
            feedUrl: url,
          })
        )
      })

      after(() => {
        sinon.restore()
      })

      context('when the user is subscribed to the feed', () => {
        let existingSubscription: Subscription

        before(async () => {
          existingSubscription = await createSubscription(
            user.id,
            'RSS Feed',
            undefined,
            SubscriptionStatus.Active,
            url,
            subscriptionType,
            url
          )
        })

        after(async () => {
          await deleteSubscription(existingSubscription.id)
        })

        it('returns an error', async () => {
          const res = await graphqlRequest(query, authToken, {
            input: { url, subscriptionType },
          }).expect(200)
          expect(res.body.data.subscribe.errorCodes).to.eql([
            'ALREADY_SUBSCRIBED',
          ])
        })
      })

      context('when the user unsubscribed the feed', () => {
        let existingSubscription: Subscription

        before(async () => {
          existingSubscription = await createSubscription(
            user.id,
            'RSS Feed',
            undefined,
            SubscriptionStatus.Unsubscribed,
            url,
            subscriptionType,
            url
          )
        })

        after(async () => {
          await deleteSubscription(existingSubscription.id)
        })

        it('re-subscribes the user', async () => {
          const res = await graphqlRequest(query, authToken, {
            input: { url, subscriptionType },
          }).expect(200)
          expect(res.body.data.subscribe.subscriptions).to.have.lengthOf(1)
          expect(res.body.data.subscribe.subscriptions[0].id).to.be.a('string')
        })
      })

      it('creates a rss subscription', async () => {
        const res = await graphqlRequest(query, authToken, {
          input: { url, subscriptionType },
        }).expect(200)
        expect(res.body.data.subscribe.subscriptions).to.have.lengthOf(1)
        expect(res.body.data.subscribe.subscriptions[0].id).to.be.a('string')

        // clean up
        await deleteSubscription(res.body.data.subscribe.subscriptions[0].id)
      })
    })
  })

  describe('Get Subscription', () => {
    const query = `
      query Subscription($id: ID!) {
        subscription(id: $id) {
          ... on SubscriptionSuccess {
            subscription {
              id
              name
            }
          }
          ... on SubscriptionError {
            errorCodes
          }
        }
      }
    `
    let existingSubscription: Subscription

    before(async () => {
      // create test newsletter subscriptions
      const newsletterEmail = await createNewsletterEmail(user.id)
      existingSubscription = await createSubscription(
        user.id,
        'sub_1',
        newsletterEmail
      )
    })

    after(async () => {
      await deleteSubscription(existingSubscription.id)
    })

    it('returns the subscription', async () => {
      const res = await graphqlRequest(query, authToken, {
        id: existingSubscription.id,
      }).expect(200)
      expect(res.body.data.subscription.subscription).to.eql({
        id: existingSubscription.id,
        name: existingSubscription.name,
      })
    })

    it('returns an error when the subscription does not exist', async () => {
      const res = await graphqlRequest(query, authToken, {
        id: generateFakeUuid(),
      }).expect(200)
      expect(res.body.data.subscription.errorCodes).to.eql(['NOT_FOUND'])
    })
  })
})
