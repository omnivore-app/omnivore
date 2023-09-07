import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { findLibraryItemById } from '../../src/services/library_item'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

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
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('addPopularRead', () => {
    it('should add a new article if the readName is valid', async () => {
      const readName = 'omnivore_ios'
      const res = await graphqlRequest(
        addPopularReadQuery(readName),
        authToken
      ).expect(200)
      expect(res.body.data.addPopularRead.pageId).to.be

      const item = await findLibraryItemById(
        res.body.data.addPopularRead.pageId,
        user.id
      )
      expect(item?.originalUrl).to.eq(
        'https://blog.omnivore.app/p/saving-links-from-your-iphone-or'
      )
      expect(item?.wordCount).to.eq(371)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      const readName = 'omnivore_web'
      return graphqlRequest(
        addPopularReadQuery(readName),
        invalidAuthToken
      ).expect(500)
    })
  })
})
