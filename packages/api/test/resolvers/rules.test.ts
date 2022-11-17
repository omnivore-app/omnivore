import 'mocha'
import { expect } from 'chai'
import { graphqlRequest, request } from '../util'
import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { getRepository } from '../../src/entity/utils'
import { Rule } from '../../src/entity/rule'

describe('Rules Resolver', () => {
  const username = 'fakeUser'

  let user: User
  let authToken: string

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

  describe('set rules', () => {
    const setRulesQuery = (
      query: string,
      actions: { type: string; params: string[] }[],
      enabled: boolean,
      id?: string
    ) => `
      mutation SetRule($input: SetRuleInput!) {
        setRule(input: {
          ${id ? `id: "${id}",` : ''}
          query: "${query}",
          actions: ${JSON.stringify(actions)},
          enabled: ${enabled}
        }) {
          ... on SetRuleSuccess {
            rule {
              id
              query
              actions {
                type
                params
              }
              enabled
              createdAt
              updatedAt
            }
          }
          ... on SetRuleError {
            errorCodes
          }
        }
      }          
    `

    after(async () => {
      await getRepository(Rule).delete({ user: { id: user.id } })
    })

    it('should set rules', async () => {
      const query = setRulesQuery(
        'test',
        [{ type: 'ADD_LABEL', params: [] }],
        true
      )

      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.setRule.rule.query).to.equal('test')
    })
  })
})
