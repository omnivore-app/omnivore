"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const api_key_1 = require("../../src/services/api_key");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
const testAPIKey = (apiKey) => {
    const query = `
    query {
      search(first: 1) {
        ... on SearchSuccess {
          edges {
            cursor
          }
        }
        ... on SearchError {
          errorCodes
        }
      }
    }
   `;
    return (0, util_1.graphqlRequest)(query, apiKey);
};
describe('Api Key resolver', () => {
    let authToken;
    let user;
    let query;
    let expiresAt;
    let name;
    let apiKeyId;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fake_user');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('generate api key', () => {
        beforeEach(() => {
            query = `
      mutation {
        generateApiKey(input: {
          name: "${name}"
          expiresAt: "${expiresAt}"
        }) {
          ... on GenerateApiKeySuccess {
            apiKey {
              key
            }
          }
          ... on GenerateApiKeyError {
            errorCodes
          }
        }
      }
    `;
        });
        context('when api key is not expired', () => {
            before(() => {
                name = 'test';
                expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
            });
            it('should generate an api key', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.generateApiKey.apiKey.key).to.be.a('string');
                return testAPIKey(response.body.data.generateApiKey.apiKey.key).expect(200);
            });
        });
        context('when api key is expired', () => {
            before(() => {
                name = 'test-expired';
                expiresAt = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
            });
            it('should generate an expired api key', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.generateApiKey.apiKey.key).to.be.a('string');
                return testAPIKey(response.body.data.generateApiKey.apiKey.key).expect(500);
            });
        });
    });
    describe('revoke api key', () => {
        let apiKey;
        before(async () => {
            query = `
      mutation {
        generateApiKey(input: {
          name: "test-revoke"
          expiresAt: "${new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()}"
        }) {
          ... on GenerateApiKeySuccess {
            apiKey {
              id
              key
            }
          }
          ... on GenerateApiKeyError {
            errorCodes
          }
        }
      }
    `;
            const response = await (0, util_1.graphqlRequest)(query, authToken);
            apiKey = response.body.data.generateApiKey.apiKey.key;
            apiKeyId = response.body.data.generateApiKey.apiKey.id;
        });
        it('should revoke an api key', async () => {
            query = `
      mutation {
        revokeApiKey(id: "${apiKeyId}") {
          ... on RevokeApiKeySuccess {
            apiKey {
              id
            }
          }
          ... on RevokeApiKeyError {
            errorCodes
          }
        }
      }
    `;
            const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(response.body.data.revokeApiKey.apiKey.id).to.be.a('string');
            return testAPIKey(apiKey).expect(500);
        });
    });
    describe('get api keys', () => {
        let apiKeys = [];
        before(async () => {
            name = 'test-get-api-keys';
            query = `
      mutation {
        generateApiKey(input: {
          name: "${name}"
          expiresAt: "${new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()}"
        }) {
          ... on GenerateApiKeySuccess {
            apiKey {
              id
              key
            }
          }
          ... on GenerateApiKeyError {
            errorCodes
          }
        }
      }
    `;
            apiKeys = await (0, api_key_1.findApiKeys)(user.id, undefined, ['id', 'name']);
        });
        it('should get api keys', async () => {
            query = `
      query {
        apiKeys {
          ... on ApiKeysSuccess {
            apiKeys {
              id
              name
            }
          }
          ... on ApiKeysError {
            errorCodes
          }
        }
      }
    `;
            const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(response.body.data.apiKeys.apiKeys).to.be.an('array');
            (0, chai_1.expect)(response.body.data.apiKeys.apiKeys).to.eql(apiKeys);
        });
    });
});
