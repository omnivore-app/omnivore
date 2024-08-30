import { expect } from 'chai'
import 'mocha'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { User } from '../../src/entity/user'
import {
  DeleteNewsletterEmailErrorCode,
  SubscriptionStatus,
} from '../../src/generated/graphql'
import { getRepository } from '../../src/repository'
import {
  createNewsletterEmail,
  deleteNewsletterEmail,
  findNewsletterEmailByAddress,
  findNewsletterEmailById,
} from '../../src/services/newsletters'
import { createSubscription } from '../../src/services/subscriptions'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

describe('Newsletters API', () => {
  const defaultFolder = 'inbox'
  let user: User
  let authToken: string

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken as string
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
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
              folder
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
        const newsletterEmail1 = await createNewsletterEmail(user.id)
        const newsletterEmail2 = await createNewsletterEmail(user.id)
        newsletterEmails = [newsletterEmail1, newsletterEmail2]

        //  create testing subscriptions
        await createSubscription(user.id, 'sub', newsletterEmail2)
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          response.body.data.newsletterEmails.newsletterEmails.map((e: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
            folder: defaultFolder,
          },
          {
            id: newsletterEmails[0].id,
            address: newsletterEmails[0].address,
            confirmationCode: newsletterEmails[0].confirmationCode,
            createdAt:
              newsletterEmails[0].createdAt.toISOString().split('.')[0] + 'Z',
            subscriptionCount: 0,
            folder: defaultFolder,
          },
        ])
      })
    })

    context('when unsubscribe newsletter email', () => {
      let newsletterEmail: NewsletterEmail

      before(async () => {
        //  create test newsletter emails
        newsletterEmail = await createNewsletterEmail(user.id)

        //  create unsubscribed subscriptions
        await createSubscription(
          user.id,
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
      mutation CreateNewsletterEmail($input: CreateNewsletterEmailInput!) {
        createNewsletterEmail(input: $input) {
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
      const folder = 'following'
      const response = await graphqlRequest(query, authToken, {
        input: {
          folder,
        },
      }).expect(200)
      const newsletterEmail = await findNewsletterEmailById(
        response.body.data.createNewsletterEmail.newsletterEmail.id
      )
      expect(newsletterEmail).not.to.be.undefined
      expect(newsletterEmail?.folder).to.eql(folder)
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
        const newsletterEmail = await createNewsletterEmail(user.id)
        newsletterEmailId = newsletterEmail.id
      })

      after(async () => {
        // clean up
        await getRepository(NewsletterEmail).delete(newsletterEmailId)
      })

      it('responds with status code 200', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        const newsletterEmail = await findNewsletterEmailByAddress(
          response.body.data.deleteNewsletterEmail.newsletterEmail.address
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

  describe('Update newsletter email', () => {
    const query = `
      mutation UpdateNewsletterEmail($input: UpdateNewsletterEmailInput!) {
        updateNewsletterEmail(input: $input) {
          ... on UpdateNewsletterEmailSuccess {
            newsletterEmail {
              id
              address
              folder
            }
          }
          ... on UpdateNewsletterEmailError {
            errorCodes
          }
        }
      }
    `

    context('when newsletter email exists', () => {
      let newsletterEmailId = 'Newsletter email id'

      before(async () => {
        //  create test newsletter emails
        const newsletterEmail = await createNewsletterEmail(
          user.id,
          undefined,
          'inbox'
        )
        newsletterEmailId = newsletterEmail.id
      })

      after(async () => {
        // clean up
        await deleteNewsletterEmail(newsletterEmailId)
      })

      it('responds with status code 200', async () => {
        const folder = 'following'
        const response = await graphqlRequest(query, authToken, {
          input: {
            id: newsletterEmailId,
            folder,
          },
        }).expect(200)
        expect(
          response.body.data.updateNewsletterEmail.newsletterEmail.folder
        ).to.eql(folder)
        const newsletterEmail = await findNewsletterEmailById(newsletterEmailId)
        expect(newsletterEmail?.folder).to.eql(folder)
      })
    })
  })
})
