import { expect } from 'chai'
import 'mocha'
import { getPageByParam } from '../../src/elastic/pages'
import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'

const MOCK_USERNAME = 'fakeuser'

describe('PopularReads API', () => {
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
    user = await createTestUser(MOCK_USERNAME)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
  })

  describe('addPopularRead', () => {
    it('should add a new article if the readName is valid', async () => {
      const readName = 'omnivore_get_started'
      const res = await graphqlRequest(
        addPopularReadQuery(readName),
        authToken
      ).expect(200)
      expect(res.body.data.addPopularRead.pageId).to.be

      const page = await getPageByParam({
        userId: user.id,
        _id: res.body.data.addPopularRead.pageId,
      })
      expect(page?.url).to.eq(
        'https://blog.omnivore.app/p/getting-started-with-omnivore'
      )
      expect(page?.wordsCount).to.eq(1155)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      const readName = 'omnivore_get_started'
      return graphqlRequest(
        addPopularReadQuery(readName),
        invalidAuthToken
      ).expect(500)
    })
  })
})
