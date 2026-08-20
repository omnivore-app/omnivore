"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const newsletter_email_1 = require("../../src/entity/newsletter_email");
const graphql_1 = require("../../src/generated/graphql");
const repository_1 = require("../../src/repository");
const newsletters_1 = require("../../src/services/newsletters");
const subscriptions_1 = require("../../src/services/subscriptions");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Newsletters API', () => {
    const defaultFolder = 'inbox';
    let user;
    let authToken;
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
    describe('Get newsletter emails', () => {
        const query = `
      query {
        newsletterEmails {
          ... on NewsletterEmailsSuccess {
            newsletterEmails {
              id
              address
              confirmationCode
              createdAt
              subscriptionCount
              folder
            }
          }
  
          ... on NewsletterEmailsError {
            errorCodes
          }
        }
      }
    `;
        context('when has active subscriptions', () => {
            let newsletterEmails;
            before(async () => {
                //  create test newsletter emails
                const newsletterEmail1 = await (0, newsletters_1.createNewsletterEmail)(user.id);
                const newsletterEmail2 = await (0, newsletters_1.createNewsletterEmail)(user.id);
                newsletterEmails = [newsletterEmail1, newsletterEmail2];
                //  create testing subscriptions
                await (0, subscriptions_1.createSubscription)(user.id, 'sub', newsletterEmail2);
            });
            after(async () => {
                // clean up
                await (0, repository_1.getRepository)(newsletter_email_1.NewsletterEmail).delete(newsletterEmails.map((e) => e.id));
            });
            it('responds with newsletter emails sort by created_at desc', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                response.body.data.newsletterEmails.newsletterEmails.map((e) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return {
                        ...e,
                        createdAt: new Date(e.createdAt).toISOString().split('.')[0] + 'Z',
                    };
                })).to.eqls([
                    {
                        id: newsletterEmails[1].id,
                        address: newsletterEmails[1].address,
                        confirmationCode: newsletterEmails[1].confirmationCode,
                        createdAt: newsletterEmails[1].createdAt.toISOString().split('.')[0] + 'Z',
                        subscriptionCount: 1,
                        folder: defaultFolder,
                    },
                    {
                        id: newsletterEmails[0].id,
                        address: newsletterEmails[0].address,
                        confirmationCode: newsletterEmails[0].confirmationCode,
                        createdAt: newsletterEmails[0].createdAt.toISOString().split('.')[0] + 'Z',
                        subscriptionCount: 0,
                        folder: defaultFolder,
                    },
                ]);
            });
        });
        context('when unsubscribe newsletter email', () => {
            let newsletterEmail;
            before(async () => {
                //  create test newsletter emails
                newsletterEmail = await (0, newsletters_1.createNewsletterEmail)(user.id);
                //  create unsubscribed subscriptions
                await (0, subscriptions_1.createSubscription)(user.id, 'sub', newsletterEmail, graphql_1.SubscriptionStatus.Unsubscribed);
            });
            after(async () => {
                // clean up
                await (0, repository_1.getRepository)(newsletter_email_1.NewsletterEmail).delete(newsletterEmail.id);
            });
            it('responds with right count of subscriptions', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.newsletterEmails.newsletterEmails[0]
                    .subscriptionCount).to.eqls(0);
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        query {
          newsletterEmails {
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
    describe('Create newsletter email', () => {
        const query = `
      mutation CreateNewsletterEmail($input: CreateNewsletterEmailInput!) {
        createNewsletterEmail(input: $input) {
          ... on CreateNewsletterEmailSuccess {
            newsletterEmail {
              id
              address
            }
          }
          ... on CreateNewsletterEmailError {
            errorCodes
          }
        }
      }
    `;
        it('responds with status code 200', async () => {
            const folder = 'following';
            const response = await (0, util_1.graphqlRequest)(query, authToken, {
                input: {
                    folder,
                },
            }).expect(200);
            const newsletterEmail = await (0, newsletters_1.findNewsletterEmailById)(response.body.data.createNewsletterEmail.newsletterEmail.id);
            (0, chai_1.expect)(newsletterEmail).not.to.be.undefined;
            (0, chai_1.expect)(newsletterEmail?.folder).to.eql(folder);
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        mutation {
          createNewsletterEmail()
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Delete newsletter email', () => {
        let newsletterEmailId = 'Newsletter email id';
        let query;
        beforeEach(() => {
            query = `
        mutation {
          deleteNewsletterEmail(newsletterEmailId: "${newsletterEmailId}") {
            ... on DeleteNewsletterEmailSuccess {
              newsletterEmail {
                id
                address
              }
            }
            ... on DeleteNewsletterEmailError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when newsletter email exists', () => {
            before(async () => {
                //  create test newsletter emails
                const newsletterEmail = await (0, newsletters_1.createNewsletterEmail)(user.id);
                newsletterEmailId = newsletterEmail.id;
            });
            after(async () => {
                // clean up
                await (0, repository_1.getRepository)(newsletter_email_1.NewsletterEmail).delete(newsletterEmailId);
            });
            it('responds with status code 200', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const newsletterEmail = await (0, newsletters_1.findNewsletterEmailByAddress)(response.body.data.deleteNewsletterEmail.newsletterEmail.address);
                (0, chai_1.expect)(newsletterEmail).to.be.null;
            });
        });
        context('when newsletter email not exists', () => {
            before(() => {
                newsletterEmailId = (0, util_1.generateFakeUuid)();
            });
            it('responds with error code NOT_FOUND', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.deleteNewsletterEmail.errorCodes).to.eql([
                    graphql_1.DeleteNewsletterEmailErrorCode.NotFound,
                ]);
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        mutation {
          deleteNewsletterEmail()
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Update newsletter email', () => {
        const query = `
      mutation UpdateNewsletterEmail($input: UpdateNewsletterEmailInput!) {
        updateNewsletterEmail(input: $input) {
          ... on UpdateNewsletterEmailSuccess {
            newsletterEmail {
              id
              address
              folder
            }
          }
          ... on UpdateNewsletterEmailError {
            errorCodes
          }
        }
      }
    `;
        context('when newsletter email exists', () => {
            let newsletterEmailId = 'Newsletter email id';
            before(async () => {
                //  create test newsletter emails
                const newsletterEmail = await (0, newsletters_1.createNewsletterEmail)(user.id, undefined, 'inbox');
                newsletterEmailId = newsletterEmail.id;
            });
            after(async () => {
                // clean up
                await (0, newsletters_1.deleteNewsletterEmail)(newsletterEmailId);
            });
            it('responds with status code 200', async () => {
                const folder = 'following';
                const response = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: {
                        id: newsletterEmailId,
                        folder,
                    },
                }).expect(200);
                (0, chai_1.expect)(response.body.data.updateNewsletterEmail.newsletterEmail.folder).to.eql(folder);
                const newsletterEmail = await (0, newsletters_1.findNewsletterEmailById)(newsletterEmailId);
                (0, chai_1.expect)(newsletterEmail?.folder).to.eql(folder);
            });
        });
    });
});
