import { expect } from 'chai'
import 'mocha'
import { SearchHistory } from '../../src/entity/search_history'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/repository'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

xdescribe('recent_searches resolver', () => {
  let user: User
  let authToken: string

  before(async () => {
    // create fake user and login
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

  describe('recentSearches API', () => {
    const recentSearchesQuery = `
        query {
          recentSearches {
            ... on RecentSearchesSuccess {
              searches {
                term
              }
            }
          }
        }
      `

    before(async () => {
      // create fake recent searches
      await getRepository(SearchHistory).save([
        {
          user: { id: user.id },
          term: 'test1',
        },
        {
          user: { id: user.id },
          term: 'test2',
        },
      ])
    })

    after(async () => {
      await getRepository(SearchHistory).delete({ user: { id: user.id } })
    })

    it('returns recent searches', async () => {
      const response = await graphqlRequest(
        recentSearchesQuery,
        authToken
      ).expect(200)
      expect(response.body.data.recentSearches.searches).to.be.lengthOf(2)
    })
  })
})
