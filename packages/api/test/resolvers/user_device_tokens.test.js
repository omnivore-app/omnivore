"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const graphql_1 = require("../../src/generated/graphql");
const user_1 = require("../../src/services/user");
const user_device_tokens_1 = require("../../src/services/user_device_tokens");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Device tokens API', () => {
    let authToken;
    let deviceToken;
    let user;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        //  create test device token
        deviceToken = await (0, db_1.createTestDeviceToken)(user);
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('Set device token', () => {
        let token = 'Some token';
        let tokenId = 'Some device token id';
        let query;
        beforeEach(() => {
            query = `
        mutation {
          setDeviceToken(
            input: {
              id: "${tokenId}"
              token: "${token}"
            }
          ) {
            ... on SetDeviceTokenSuccess {
              deviceToken {
                id
                token
                createdAt
              }
            }
            ... on SetDeviceTokenError {
              errorCodes
            }
          }
        }
      `;
        });
        after(async () => {
            // clean up
            await (0, user_device_tokens_1.deleteDeviceTokens)(user.id, { user: { id: user.id } });
        });
        context('when id in input is not null', () => {
            context('when token exists', () => {
                before(() => {
                    tokenId = deviceToken.id;
                    token = '';
                });
                it('responds with status code 200 and deletes the token', async () => {
                    const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                    const deviceToken = await (0, user_device_tokens_1.findDeviceTokenById)(response.body.data.setDeviceToken.deviceToken.id, user.id);
                    (0, chai_1.expect)(deviceToken).to.be.null;
                });
            });
            context('when token not exists', () => {
                before(() => {
                    tokenId = (0, util_1.generateFakeUuid)();
                    token = '';
                });
                it('responds with error code NOT_FOUND', async () => {
                    const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                    (0, chai_1.expect)(response.body.data.setDeviceToken.errorCodes).to.eql([
                        graphql_1.SetDeviceTokenErrorCode.NotFound,
                    ]);
                });
            });
        });
        context('when id in input is null and token is not null', () => {
            before(() => {
                tokenId = '';
                token = 'Some new token';
            });
            it('responds with status code 200 and creates the token', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const deviceToken = await (0, user_device_tokens_1.findDeviceTokenById)(response.body.data.setDeviceToken.deviceToken.id, user.id);
                (0, chai_1.expect)(deviceToken).not.to.be.null;
            });
        });
        context('when both id and token in input are null', () => {
            before(() => {
                tokenId = '';
                token = '';
            });
            it('responds with error code BAD_REQUEST', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.setDeviceToken.errorCodes).to.eql([
                    graphql_1.SetDeviceTokenErrorCode.BadRequest,
                ]);
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        mutation {
          setDeviceToken()
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Get device tokens', () => {
        const token = 'Some token';
        const query = `
      query {
        deviceTokens {
          ... on DeviceTokensSuccess {
            deviceTokens {
              id
              token
              createdAt
            }
          }
          ... on DeviceTokensError {
            errorCodes
          }
        }
      }
    `;
        before(async () => {
            // create test device token
            await (0, user_device_tokens_1.createDeviceToken)(user.id, token);
        });
        after(async () => {
            // clean up
            await (0, user_device_tokens_1.deleteDeviceTokens)(user.id, { token });
        });
        it('responds with status code 200 and returns all device tokens', async () => {
            const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(response.body.data.deviceTokens.deviceTokens).to.have.lengthOf(1);
        });
    });
});
