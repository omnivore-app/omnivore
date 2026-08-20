"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Send Install Instructions API', () => {
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
    describe('Send install instructions', () => {
        const query = `
      query SendInstallInstructions {
        sendInstallInstructions {
          ... on SendInstallInstructionsSuccess {
        sent
          }
        }

      sendInstallInstructions {
          ... on SendInstallInstructionsError {
        errorCodes
          }
        }
      }
    `;
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        query {
          sendInstallInstructions {
          }
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
});
