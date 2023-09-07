import { expect } from 'chai'
import 'mocha'
import { Rule, RuleAction, RuleActionType } from '../../src/entity/rule'
import { User } from '../../src/entity/user'
import { createRule, deleteRules } from '../../src/services/rules'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

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
    await deleteUser(user.id)
  })

  describe('set rules', () => {
    const setRulesQuery = (
      name: string,
      filter: string,
      actions: RuleAction[],
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
          eventTypes: [PAGE_CREATED, PAGE_UPDATED]
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
      await deleteRules(user.id)
    })

    it('should set rules', async () => {
      const query = setRulesQuery(
        'test rule',
        'test filter',
        [{ type: RuleActionType.SendNotification, params: [] }],
        true
      )

      const res = await graphqlRequest(query, authToken).expect(200)
      expect(res.body.data.setRule.rule.filter).to.equal('test filter')
    })
  })

  describe('get rules', () => {
    before(async () => {
      await createRule(user.id, {
        name: 'test rule 2',
        filter: 'test filter 2',
        actions: [{ type: RuleActionType.SendNotification, params: [] }],
      })
    })

    after(async () => {
      await deleteRules(user.id)
    })

    const getRulesQuery = (enabled: boolean | null = null) => `
      query {
        rules (enabled: ${enabled}) {
          ... on RulesSuccess {
            rules {
              id
              name
              filter
              actions {
                type
                params
              }
              enabled
              createdAt
              updatedAt
              eventTypes
            }
          }
          ... on RulesError {
            errorCodes
          }
        }
      }
    `

    it('should get rules', async () => {
      const res = await graphqlRequest(getRulesQuery(), authToken).expect(200)
      expect(res.body.data.rules.rules.length).to.equal(1)
    })
  })

  describe('delete rules', () => {
    let rule: Rule

    before(async () => {
      rule = await createRule(user.id, {
        name: 'test rule 3',
        filter: 'test filter 3',
        actions: [{ type: RuleActionType.SendNotification, params: [] }],
      })
    })

    const deleteRulesQuery = (id: string) => `
      mutation {
        deleteRule(id: "${id}") {
          ... on DeleteRuleSuccess {
            rule {
              id
            }
          }
          ... on DeleteRuleError {
            errorCodes
          }
        }
      }
    `

    it('should delete rules', async () => {
      const res = await graphqlRequest(
        deleteRulesQuery(rule.id),
        authToken
      ).expect(200)
      expect(res.body.data.deleteRule.rule.id).to.equal(rule.id)
    })
  })
})
