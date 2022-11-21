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
      name: string,
      filter: string,
      actions: { type: string; params: string[] }[],
      enabled: boolean,
      id?: string
    ) => `
      mutation {
        setRule(input: {
          ${id ? `id: "${id}",` : ''}
          name: "${name}",
          filter: "${filter}",
          actions: [${actions.map(
            (action) => `{
            type: ${action.type}, params: [${action.params.map(
              (param) => `"${param}"`
            )}]
            }`
          )}],
          enabled: ${enabled}
        }) {
          ... on SetRuleSuccess {
            rule {
              id
              filter
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
        'test rule',
        'test filter',
        [{ type: 'ADD_LABEL', params: [] }],
        true
      )

      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.setRule.rule.filter).to.equal('test filter')
    })
  })
})
