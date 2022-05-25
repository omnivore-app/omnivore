import { createTestSubscription, createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { Subscription } from '../../src/entity/subscription'
import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { getPageById, getPageByParam } from '../../src/elastic/pages'

describe('PopularReads API', () => {
  const username = 'fakeUser'

  let user: User
  let authToken: string

  const addPopularReadQuery = (readName: string) => {
    return `
      mutation {
        addPopularRead(name: "${readName}") {
          ... on AddPopularReadSuccess {
            pageId
          }
          ... on AddPopularReadError {
            errorCodes
          }
        }
      }
    `
  }

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  describe('addPopularRead', () => {
    it('should add a new article if the readName is valid', async () => {
      const readName = 'omnivore_get_started'
      const res = await graphqlRequest(addPopularReadQuery(readName), authToken).expect(200)
      expect(res.body.data.addPopularRead.pageId).to.be

      const page = await getPageByParam({ userId: user.id, _id: res.body.data.addPopularRead.pageId })
      expect(page?.url).to.eq('https://blog.omnivore.app/p/getting-started-with-omnivore')
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      const readName = 'omnivore_get_started'
      return graphqlRequest(addPopularReadQuery(readName), invalidAuthToken).expect(500)
    })
  })
})
