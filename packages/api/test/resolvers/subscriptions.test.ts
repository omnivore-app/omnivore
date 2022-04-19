import { createTestSubscription, createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { Subscription } from '../../src/entity/subscription'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'

describe('Subscriptions API', () => {
  const username = 'fakeUser'

  let user: User
  let authToken: string
  let subscriptions: Subscription[]

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    //  create testing subscriptions
    const sub1 = await createTestSubscription(user, 'sub_1')
    const sub2 = await createTestSubscription(user, 'sub_2')
    subscriptions = [sub2, sub1]
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
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
