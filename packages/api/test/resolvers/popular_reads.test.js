"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const library_item_1 = require("../../src/services/library_item");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('PopularReads API', () => {
    let user;
    let authToken;
    const addPopularReadQuery = (readName) => {
        return `
      mutation {
        addPopularRead(name: "${readName}") {
          ... on AddPopularReadSuccess {
            pageId
          }
          ... on AddPopularReadError {
            errorCodes
          }
        }
      }
    `;
    };
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
    describe('addPopularRead', () => {
        it('should add a new article if the readName is valid', async () => {
            const readName = 'omnivore_ios';
            const res = await (0, util_1.graphqlRequest)(addPopularReadQuery(readName), authToken).expect(200);
            (0, chai_1.expect)(res.body.data.addPopularRead.pageId).to.be;
            const item = await (0, library_item_1.findLibraryItemById)(res.body.data.addPopularRead.pageId, user.id);
            (0, chai_1.expect)(item?.originalUrl).to.eq('https://blog.omnivore.work/p/saving-links-from-your-iphone-or');
            (0, chai_1.expect)(item?.wordCount).to.eq(371);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            const readName = 'omnivore_web';
            return (0, util_1.graphqlRequest)(addPopularReadQuery(readName), invalidAuthToken).expect(500);
        });
    });
});
