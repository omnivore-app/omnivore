import 'mocha'
import { expect } from 'chai'
import { graphqlRequest, request } from '../util'
import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { getRepository } from '../../src/entity'
import { Rule, RuleAction, RuleActionType } from '../../src/entity/rule'

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
    await deleteTestUser(user.id)
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
      await getRepository(Rule).delete({ user: { id: user.id } })
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
      await getRepository(Rule).save({
        user: { id: user.id },
        name: 'test rule',
        filter: 'test filter',
        actions: [{ type: RuleActionType.SendNotification, params: [] }],
        enabled: true,
      })
    })

    after(async () => {
      await getRepository(Rule).delete({ user: { id: user.id } })
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
      rule = await getRepository(Rule).save({
        user: { id: user.id },
        name: 'test rule',
        filter: 'test filter',
        actions: [{ type: RuleActionType.SendNotification, params: [] }],
        enabled: true,
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
