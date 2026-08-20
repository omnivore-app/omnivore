"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const search_history_1 = require("../../src/entity/search_history");
const repository_1 = require("../../src/repository");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
xdescribe('recent_searches resolver', () => {
    let user;
    let authToken;
    before(async () => {
        // create fake user and login
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
    describe('recentSearches API', () => {
        const recentSearchesQuery = `
        query {
          recentSearches {
            ... on RecentSearchesSuccess {
              searches {
                term
              }
            }
          }
        }
      `;
        before(async () => {
            // create fake recent searches
            await (0, repository_1.getRepository)(search_history_1.SearchHistory).save([
                {
                    user: { id: user.id },
                    term: 'test1',
                },
                {
                    user: { id: user.id },
                    term: 'test2',
                },
            ]);
        });
        after(async () => {
            await (0, repository_1.getRepository)(search_history_1.SearchHistory).delete({ user: { id: user.id } });
        });
        it('returns recent searches', async () => {
            const response = await (0, util_1.graphqlRequest)(recentSearchesQuery, authToken).expect(200);
            (0, chai_1.expect)(response.body.data.recentSearches.searches).to.be.lengthOf(2);
        });
    });
});
