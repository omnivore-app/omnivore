import { createTestSubscription, createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { Subscription } from '../../src/entity/subscription'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/entity/utils'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { SubscriptionStatus } from '../../src/generated/graphql'

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

    //  create testing subscriptions
    const sub1 = await createTestSubscription(user, 'sub_1', newsletterEmail)
    const sub2 = await createTestSubscription(user, 'sub_2', newsletterEmail)
    await createTestSubscription(
      user,
      'sub_3',
      newsletterEmail,
      SubscriptionStatus.Unsubscribed
    )
    subscriptions = [sub2, sub1]
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
})
