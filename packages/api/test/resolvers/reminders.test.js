"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const luxon_1 = require("luxon");
require("mocha");
const graphql_1 = require("../../src/generated/graphql");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
xdescribe('Reminders API', () => {
    let authToken;
    let item;
    let reminder;
    let user;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        // create page, link and reminders test data
        item = await (0, db_1.createTestLibraryItem)(user.id);
        reminder = await (0, db_1.createTestReminder)(user, item.id);
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('Get reminder', () => {
        let linkId;
        let query;
        beforeEach(() => {
            query = `
        query {
          reminder(linkId: "${linkId}") {
            ... on ReminderSuccess {
              reminder {
                id
                remindAt
              }
            }
            ... on ReminderError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when reminder is found', () => {
            before(() => {
                // existing page id
                linkId = item.id;
            });
            it('responds with the reminder', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.reminder.reminder.id).to.eql(reminder.id);
            });
        });
        context('when reminder is not found', () => {
            before(() => {
                // fake page id
                linkId = (0, util_1.generateFakeUuid)();
            });
            it('responds error code NOT_FOUND', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.reminder.errorCodes).to.eql([
                    graphql_1.ReminderErrorCode.NotFound,
                ]);
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
      query {
        reminder {
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
    describe('Create reminder', () => {
        const remindAt = luxon_1.DateTime.now().plus({ days: 1 }).toISODate();
        let linkId = 'Link id';
        let query;
        beforeEach(() => {
            query = `
        mutation {
          createReminder(
            input: {
              linkId: "${linkId}"
              remindAt: "${remindAt}"
              sendNotification: true
              archiveUntil: false
            }
          ) {
            ... on CreateReminderSuccess {
              reminder {
                id
                remindAt
              }
            }
            ... on CreateReminderError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when link is valid', () => {
            before(() => {
                linkId = item.id;
            });
            it('responds with status code 200', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const reminder = await (0, db_1.getReminder)(response.body.data.createReminder.id);
                (0, chai_1.expect)(reminder).not.to.be.undefined;
            });
        });
        context('when no link id and client request id', () => {
            before(() => {
                linkId = '';
            });
            it('responds with error code BAD_REQUEST', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.createReminder.errorCodes).to.eql([
                    graphql_1.CreateReminderErrorCode.BadRequest,
                ]);
            });
        });
        context('when no article found', () => {
            before(() => {
                // fake page id
                linkId = (0, util_1.generateFakeUuid)();
            });
            it('responds with error code NOT_FOUND', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.createReminder.errorCodes).to.eql([
                    graphql_1.CreateReminderErrorCode.NotFound,
                ]);
            });
        });
        it('responds with status code 400 if invalid query', async () => {
            const invalidQuery = `
        mutation {
          createReminder()
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds with status code 400 if invalid user', async () => {
            const fakeToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, fakeToken).expect(500);
        });
    });
    describe('Update reminder', () => {
        const remindAt = luxon_1.DateTime.now().plus({ days: 1 }).toISODate();
        let query;
        let reminderId = 'Reminder id';
        beforeEach(() => {
            query = `
        mutation {
          updateReminder(
            input: {
              id: "${reminderId}"
              remindAt: "${remindAt}"
              sendNotification: true
              archiveUntil: false
            }
          ) {
            ... on UpdateReminderSuccess {
              reminder {
                id
                remindAt
              }
            }
            ... on UpdateReminderError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when reminder exists', () => {
            before(() => {
                reminderId = reminder.id;
            });
            it('responds with status code 200', async () => {
                await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const reminder = await (0, db_1.getReminder)(reminderId);
                (0, chai_1.expect)(reminder?.sendNotification).to.be.true;
            });
        });
        context('when reminder is not found', () => {
            before(() => {
                // fake reminder id
                reminderId = (0, util_1.generateFakeUuid)();
            });
            it('responds with error code NOT_FOUND', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.updateReminder.errorCodes).to.eql([
                    graphql_1.UpdateReminderErrorCode.NotFound,
                ]);
            });
        });
        it('responds with status code 400 if invalid query', async () => {
            const invalidQuery = `
        mutation {
          updateReminder()
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds with status code 500 if invalid user', async () => {
            const fakeToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, fakeToken).expect(500);
        });
    });
    describe('Delete reminder', () => {
        let reminderId = 'reminderId';
        let query;
        beforeEach(() => {
            query = `
        mutation {
          deleteReminder(id: "${reminderId}") {
            ... on DeleteReminderSuccess {
              reminder {
                id
                remindAt
              }
            }
            ... on DeleteReminderError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when reminder exists', () => {
            before(() => {
                reminderId = reminder.id;
            });
            it('responds status code 200', async () => {
                await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const reminder = await (0, db_1.getReminder)(reminderId);
                (0, chai_1.expect)(reminder?.status).to.eql('DELETED');
            });
        });
        context('when reminders is not found', () => {
            before(() => {
                // fake reminder id
                reminderId = (0, util_1.generateFakeUuid)();
            });
            it('responds error code NOT_FOUND', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.deleteReminder.errorCodes).to.eql([
                    graphql_1.ReminderErrorCode.NotFound,
                ]);
            });
        });
        it('responds status code 400 if invalid query', async () => {
            const invalidQuery = `
        mutation {
          deleteReminder()
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 if invalid user', async () => {
            const fakeToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, fakeToken).expect(500);
        });
    });
});
