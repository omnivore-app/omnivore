"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Update API', () => {
    let user;
    let authToken;
    let item;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        item = await (0, db_1.createTestLibraryItem)(user.id);
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('update page', () => {
        let query;
        const title = 'New Title';
        const description = 'New Description';
        const previewImage = 'https://omnivore.work/image.png';
        beforeEach(() => {
            query = `
        mutation {
          updatePage(
            input: {
              pageId: "${item.id}"
              title: "${title}"
              description: "${description}"
              previewImage: "${previewImage}"
            }
          ) {
            ... on UpdatePageSuccess {
              updatedPage {
                title
                description
                image
              }
            }
            ... on UpdatePageError {
              errorCodes
            }
          }
        }
      `;
        });
        it('should update page', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            const updatedPage = res?.body.data.updatePage.updatedPage;
            (0, chai_1.expect)(updatedPage?.title).to.eql(title);
            (0, chai_1.expect)(updatedPage?.description).to.eql(description);
            (0, chai_1.expect)(updatedPage?.image).to.eql(previewImage);
        });
    });
});
