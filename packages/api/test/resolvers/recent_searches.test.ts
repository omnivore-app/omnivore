import { expect } from 'chai'
import 'mocha'
import { createPubSubClient } from '../../src/pubsub'
import { PageContext } from '../../src/elastic/types'
import { SearchHistory } from '../../src/entity/search_history'
import { User } from '../../src/entity/user'
import { getRepository } from '../../src/repository'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'

describe('recent_searches resolver', () => {
  let user: User
  let authToken: string
  let ctx: PageContext

  before(async () => {
    // create fake user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })
    authToken = res.body.authToken
    ctx = {
      pubsub: createPubSubClient(),
      refresh: true,
      uid: user.id,
    }
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
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
