import {
  createTestNewsletterEmail,
  createTestUser,
  deleteTestUser,
  getNewsletterEmail,
} from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'
import { NewsletterEmail } from '../../src/entity/newsletter_email'
import { expect } from 'chai'
import { DeleteNewsletterEmailErrorCode } from '../../src/generated/graphql'
import 'mocha'

describe('Newsletters API', () => {
  const username = 'fakeUser'

  let authToken: string
  let newsletterEmails: NewsletterEmail[]

  before(async () => {
    // create test user and login
    const user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    //  create test newsletter emails
    const newsletterEmail1 = await createTestNewsletterEmail(
      user,
      'Test_email_address_1'
    )
    const newsletterEmail2 = await createTestNewsletterEmail(
      user,
      'Test_email_address_2'
    )
    newsletterEmails = [newsletterEmail1, newsletterEmail2]
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
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
            }
          }
  
          ... on NewsletterEmailsError {
            errorCodes
          }
        }
      }
    `

    it('responds with newsletter emails sort by created_at desc', async () => {
      const response = await graphqlRequest(query, authToken).expect(200)
      expect(response.body.data.newsletterEmails.newsletterEmails).to.eqls(
        newsletterEmails
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((value) => {
            return {
              id: value.id,
              address: value.address,
              confirmationCode: value.confirmationCode,
            }
          })
      )
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
      before(() => {
        newsletterEmailId = newsletterEmails[0].id
      })

      it('responds with status code 200', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        const newsletterEmail = await getNewsletterEmail(
          response.body.data.deleteNewsletterEmail.newsletterEmail.id
        )
        expect(newsletterEmail).to.be.undefined
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
