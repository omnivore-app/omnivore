import {
  createTestNewsletterEmail,
  createTestSubscription,
  createTestUser,
  deleteTestUser,
  getNewsletterEmail,
} from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { User } from '../../src/entity/user'
import { expect } from 'chai'
import {
  DeleteNewsletterEmailErrorCode,
  SubscriptionStatus,
} from '../../src/generated/graphql'
import 'mocha'
import { getRepository } from '../../src/entity'

describe('Newsletters API', () => {
  let user: User
  let authToken: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
  })

  describe('Get newsletter emails', () => {
    const query = `
      query {
        newsletterEmails {
          ... on NewsletterEmailsSuccess {
            newsletterEmails {
              id
              address
              confirmationCode
              createdAt
              subscriptionCount
            }
          }
  
          ... on NewsletterEmailsError {
            errorCodes
          }
        }
      }
    `

    context('when has active subscriptions', () => {
      let newsletterEmails: NewsletterEmail[]

      before(async () => {
        //  create test newsletter emails
        const newsletterEmail1 = await createTestNewsletterEmail(
          user,
          'Test_email_address_1@omnivore.app'
        )
        const newsletterEmail2 = await createTestNewsletterEmail(
          user,
          'Test_email_address_2@omnivore.app'
        )
        newsletterEmails = [newsletterEmail1, newsletterEmail2]

        //  create testing subscriptions
        await createTestSubscription(user, 'sub', newsletterEmail2)
      })

      after(async () => {
        // clean up
        await getRepository(NewsletterEmail).delete(
          newsletterEmails.map((e) => e.id)
        )
      })

      it('responds with newsletter emails sort by created_at desc', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(
          response.body.data.newsletterEmails.newsletterEmails.map((e: any) => {
            return {
              ...e,
              createdAt:
                new Date(e.createdAt).toISOString().split('.')[0] + 'Z',
            }
          })
        ).to.eqls([
          {
            id: newsletterEmails[1].id,
            address: newsletterEmails[1].address,
            confirmationCode: newsletterEmails[1].confirmationCode,
            createdAt:
              newsletterEmails[1].createdAt.toISOString().split('.')[0] + 'Z',
            subscriptionCount: 1,
          },
          {
            id: newsletterEmails[0].id,
            address: newsletterEmails[0].address,
            confirmationCode: newsletterEmails[0].confirmationCode,
            createdAt:
              newsletterEmails[0].createdAt.toISOString().split('.')[0] + 'Z',
            subscriptionCount: 0,
          },
        ])
      })
    })

    context('when unsubscribe newsletter email', () => {
      let newsletterEmail: NewsletterEmail

      before(async () => {
        //  create test newsletter emails
        newsletterEmail = await createTestNewsletterEmail(
          user,
          'Test_email_address_1@omnivore.app'
        )

        //  create unsubscribed subscriptions
        await createTestSubscription(
          user,
          'sub',
          newsletterEmail,
          SubscriptionStatus.Unsubscribed
        )
      })

      after(async () => {
        // clean up
        await getRepository(NewsletterEmail).delete(newsletterEmail.id)
      })

      it('responds with right count of subscriptions', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(
          response.body.data.newsletterEmails.newsletterEmails[0]
            .subscriptionCount
        ).to.eqls(0)
      })
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        query {
          newsletterEmails {
          }
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })

  describe('Create newsletter email', () => {
    const query = `
      mutation {
        createNewsletterEmail {
          ... on CreateNewsletterEmailSuccess {
            newsletterEmail {
              id
              address
            }
          }
          ... on CreateNewsletterEmailError {
            errorCodes
          }
        }
      }
    `

    it('responds with status code 200', async () => {
      const response = await graphqlRequest(query, authToken).expect(200)
      const newsletterEmail = await getNewsletterEmail(
        response.body.data.createNewsletterEmail.id
      )
      expect(newsletterEmail).not.to.be.undefined
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        mutation {
          createNewsletterEmail()
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })

  describe('Delete newsletter email', () => {
    let newsletterEmailId = 'Newsletter email id'
    let query: string

    beforeEach(() => {
      query = `
        mutation {
          deleteNewsletterEmail(newsletterEmailId: "${newsletterEmailId}") {
            ... on DeleteNewsletterEmailSuccess {
              newsletterEmail {
                id
                address
              }
            }
            ... on DeleteNewsletterEmailError {
              errorCodes
            }
          }
        }
      `
    })

    context('when newsletter email exists', () => {
      before(async () => {
        //  create test newsletter emails
        const newsletterEmail = await createTestNewsletterEmail(
          user,
          'Test_email_address_1@omnivore.app'
        )
        newsletterEmailId = newsletterEmail.id
      })

      after(async () => {
        // clean up
        await getRepository(NewsletterEmail).delete(newsletterEmailId)
      })

      it('responds with status code 200', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        const newsletterEmail = await getNewsletterEmail(
          response.body.data.deleteNewsletterEmail.newsletterEmail.id
        )
        expect(newsletterEmail).to.be.null
      })
    })

    context('when newsletter email not exists', () => {
      before(() => {
        newsletterEmailId = generateFakeUuid()
      })

      it('responds with error code NOT_FOUND', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.deleteNewsletterEmail.errorCodes).to.eql([
          DeleteNewsletterEmailErrorCode.NotFound,
        ])
      })
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        mutation {
          deleteNewsletterEmail()
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
