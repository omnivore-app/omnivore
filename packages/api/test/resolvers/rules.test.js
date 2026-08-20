"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const rule_1 = require("../../src/entity/rule");
const rules_1 = require("../../src/services/rules");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Rules Resolver', () => {
    const username = 'fakeUser';
    let user;
    let authToken;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)(username);
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('set rules', () => {
        const setRulesQuery = (name, filter, actions, enabled, id) => `
      mutation {
        setRule(input: {
          ${id ? `id: "${id}",` : ''}
          name: "${name}",
          filter: "${filter}",
          actions: [${actions.map((action) => `{
            type: ${action.type}, params: [${action.params.map((param) => `"${param}"`)}]
            }`)}],
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
    `;
        after(async () => {
            await (0, rules_1.deleteRules)(user.id);
        });
        it('should set rules', async () => {
            const query = setRulesQuery('test rule', 'test filter', [{ type: rule_1.RuleActionType.SendNotification, params: [] }], true);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.setRule.rule.filter).to.equal('test filter');
        });
    });
    describe('get rules', () => {
        before(async () => {
            await (0, rules_1.createRule)(user.id, {
                name: 'test rule 2',
                filter: 'test filter 2',
                actions: [{ type: rule_1.RuleActionType.SendNotification, params: [] }],
            });
        });
        after(async () => {
            await (0, rules_1.deleteRules)(user.id);
        });
        const getRulesQuery = (enabled = null) => `
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
    `;
        it('should get rules', async () => {
            const res = await (0, util_1.graphqlRequest)(getRulesQuery(), authToken).expect(200);
            (0, chai_1.expect)(res.body.data.rules.rules.length).to.equal(1);
        });
    });
    describe('delete rules', () => {
        let rule;
        before(async () => {
            rule = await (0, rules_1.createRule)(user.id, {
                name: 'test rule 3',
                filter: 'test filter 3',
                actions: [{ type: rule_1.RuleActionType.SendNotification, params: [] }],
            });
        });
        const deleteRulesQuery = (id) => `
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
    `;
        it('should delete rules', async () => {
            const res = await (0, util_1.graphqlRequest)(deleteRulesQuery(rule.id), authToken).expect(200);
            (0, chai_1.expect)(res.body.data.deleteRule.rule.id).to.equal(rule.id);
        });
    });
});
