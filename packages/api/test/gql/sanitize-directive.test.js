"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const user_1 = require("../../src/services/user");
const auth_1 = require("../../src/utils/auth");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Sanitize Directive', () => {
    const correctPassword = 'fakePassword';
    let authToken;
    let user;
    before(async () => {
        const hashedPassword = await (0, auth_1.hashPassword)(correctPassword);
        user = await (0, db_1.createTestUser)('fake_user', '', hashedPassword);
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
    });
    after(async () => {
        await (0, user_1.deleteUser)(user.id);
    });
    describe('Update user with a bio that is too long', () => {
        const bio = ''.padStart(500, '*');
        let query;
        beforeEach(() => {
            query = `
        mutation {
          updateUser(
            input: {
              name: "fakeUser"
              bio: "${bio}"
            }
          ) {
            ... on UpdateUserSuccess {
              user {
                id
              }
            }
            ... on UpdateUserError {
              errorCodes
            }
          }
        }
      `;
        });
        it('responds status code 500 when invalid input', async () => {
            return (0, util_1.graphqlRequest)(query, authToken).expect(400);
        });
    });
});
