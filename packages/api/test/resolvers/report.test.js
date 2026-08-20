"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const content_display_report_1 = require("../../src/entity/reports/content_display_report");
const graphql_1 = require("../../src/generated/graphql");
const repository_1 = require("../../src/repository");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Report API', () => {
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
        // create a page
        item = await (0, db_1.createTestLibraryItem)(user.id);
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('reportItem', () => {
        let pageId;
        let reportTypes;
        let query;
        beforeEach(() => {
            query = `
        mutation {
          reportItem(
            input: {
              pageId: "${pageId}",
              itemUrl: "test url"
              reportTypes: [${reportTypes}],
              reportComment: "test comment"
            }
          ) {
            message
          }
        }
      `;
        });
        context('when page exists and report is content display', () => {
            before(() => {
                pageId = item.id;
                reportTypes = [graphql_1.ReportType.ContentDisplay];
            });
            it('should report an item', async () => {
                await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const report = await (0, repository_1.getRepository)(content_display_report_1.ContentDisplayReport).findOneBy({
                    libraryItemId: item.id,
                });
                (0, chai_1.expect)(report).to.exist;
            });
        });
    });
});
