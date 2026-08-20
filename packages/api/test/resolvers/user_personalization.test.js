"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const user_1 = require("../../src/services/user");
const user_personalization_1 = require("../../src/services/user_personalization");
const db_1 = require("../db");
const util_1 = require("../util");
describe('User Personalization API', () => {
    let authToken;
    let user;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('Set user personalization', () => {
        const query = `
      mutation SetUserPersonalization($input: SetUserPersonalizationInput!) {
        setUserPersonalization(input: $input) {
          ... on SetUserPersonalizationSuccess {
            updatedUserPersonalization {
              id
              fields
            }
          }
          ... on SetUserPersonalizationError {
            errorCodes
          }
        }
      }
    `;
        context('when user personalization does not exist', () => {
            it('creates a new user personalization', async () => {
                const fields = {
                    testField: 'testValue',
                };
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { fields },
                }).expect(200);
                (0, chai_1.expect)(res.body.data.setUserPersonalization.updatedUserPersonalization.fields).to.eql(fields);
                const userPersonalization = await (0, user_personalization_1.findUserPersonalization)(user.id);
                (0, chai_1.expect)(userPersonalization).to.not.be.null;
                // clean up
                await (0, user_personalization_1.deleteUserPersonalization)(user.id);
            });
        });
        context('when user personalization exists', () => {
            before(async () => {
                await (0, user_personalization_1.saveUserPersonalization)(user.id, {
                    user: { id: user.id },
                    digestConfig: {
                        channels: ['email'],
                    },
                });
            });
            after(async () => {
                // clean up
                await (0, user_personalization_1.deleteUserPersonalization)(user.id);
            });
            it('updates the user personalization', async () => {
                const newFields = {
                    channels: ['push', 'email'],
                };
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { fields: newFields },
                }).expect(200);
                (0, chai_1.expect)(res.body.data.setUserPersonalization.updatedUserPersonalization.fields).to.eql(newFields);
                const updatedUserPersonalization = await (0, user_personalization_1.findUserPersonalization)(user.id);
                (0, chai_1.expect)(updatedUserPersonalization?.fields).to.eql(newFields);
            });
            it('updates and can clear the user personalization', async () => {
                const newFields = {
                    channels: ['push', 'email'],
                };
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { fields: newFields },
                }).expect(200);
                (0, chai_1.expect)(res.body.data.setUserPersonalization.updatedUserPersonalization.fields).to.eql(newFields);
                const updatedUserPersonalization = await (0, user_personalization_1.findUserPersonalization)(user.id);
                (0, chai_1.expect)(updatedUserPersonalization?.fields).to.eql(newFields);
                const updatedFields = {
                    channels: ['push', 'email'],
                };
                const updatedRes = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { fields: updatedFields },
                }).expect(200);
                (0, chai_1.expect)(updatedRes.body.data.setUserPersonalization.updatedUserPersonalization
                    .fields).to.eql(updatedFields);
                const updatedUserPersonalization2 = await (0, user_personalization_1.findUserPersonalization)(user.id);
                (0, chai_1.expect)(updatedUserPersonalization2?.fields).to.eql(newFields);
            });
        });
    });
    describe('Get user personalization', () => {
        let existingUserPersonalization;
        before(async () => {
            existingUserPersonalization = await (0, user_personalization_1.saveUserPersonalization)(user.id, {
                user: { id: user.id },
                fields: {
                    testField: 'testValue',
                },
            });
        });
        after(async () => {
            // clean up
            await (0, user_personalization_1.deleteUserPersonalization)(user.id);
        });
        const query = `
      query GetUserPersonalization {
        getUserPersonalization {
          ... on GetUserPersonalizationSuccess {
            userPersonalization {
              id
              fields
            }
          }
          ... on GetUserPersonalizationError {
            errorCodes
          }
        }
      }
    `;
        it('returns the user personalization', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.getUserPersonalization.userPersonalization.fields).to.eql(existingUserPersonalization.fields);
        });
    });
});
