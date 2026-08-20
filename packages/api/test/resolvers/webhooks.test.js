"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const graphql_1 = require("../../src/generated/graphql");
const user_1 = require("../../src/services/user");
const webhook_1 = require("../../src/services/webhook");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Webhooks API', () => {
    let user;
    let authToken;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        // create test webhooks
        await (0, webhook_1.createWebhooks)([
            {
                url: 'http://localhost:3000/webhooks/test',
                user: { id: user.id },
                eventTypes: [graphql_1.WebhookEvent.PageCreated],
            },
            {
                url: 'http://localhost:3000/webhooks/test',
                user: { id: user.id },
                eventTypes: [graphql_1.WebhookEvent.PageUpdated],
            },
        ], user.id);
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('Get webhook', () => {
        let webhook;
        before(async () => {
            // create test webhooks
            webhook = await (0, webhook_1.createWebhook)({
                url: 'http://localhost:3000/webhooks/test',
                user: { id: user.id },
                eventTypes: [graphql_1.WebhookEvent.PageDeleted],
            }, user.id);
        });
        it('should return a webhook', async () => {
            const query = `
        query {
          webhook(id: "${webhook.id}") {
            ... on WebhookSuccess {
              webhook {
                id
                url
                eventTypes
                enabled
              }
            }
          }
        }
      `;
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.webhook.webhook.id).to.eql(webhook.id);
            (0, chai_1.expect)(res.body.data.webhook.webhook.url).to.eql(webhook.url);
            (0, chai_1.expect)(res.body.data.webhook.webhook.eventTypes).to.eql(webhook.eventTypes);
            (0, chai_1.expect)(res.body.data.webhook.webhook.enabled).to.eql(webhook.enabled);
        });
    });
    describe('List webhooks', () => {
        it('should return a list of webhooks', async () => {
            const query = `
        query {
          webhooks {
            ... on WebhooksSuccess {
              webhooks {
                id
                url
                eventTypes
                enabled
              }
            }
          }
        }
      `;
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            const webhooks = await (0, webhook_1.findWebhooks)(user.id);
            (0, chai_1.expect)(res.body.data.webhooks.webhooks).to.eql(webhooks.map((w) => ({
                id: w.id,
                url: w.url,
                eventTypes: w.eventTypes,
                enabled: w.enabled,
            })));
        });
    });
    describe('Set webhook', () => {
        let eventTypes;
        let query;
        let webhookUrl;
        let webhookId;
        let enabled;
        beforeEach(() => {
            query = `
        mutation {
          setWebhook(
            input: {
              id: "${webhookId}",
              url: "${webhookUrl}",
              eventTypes: [${eventTypes.toString()}],
              enabled: ${enabled.toString()}
            }
          ) {
            ... on SetWebhookSuccess {
              webhook {
                id
                url
                eventTypes
                enabled
              }
            }
            ... on SetWebhookError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when id is not set', () => {
            before(() => {
                webhookId = '';
                webhookUrl = 'http://localhost:3000/webhooks/test';
                eventTypes = [graphql_1.WebhookEvent.HighlightCreated];
                enabled = true;
            });
            it('should create a webhook', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.setWebhook.webhook).to.be.an('object');
                (0, chai_1.expect)(res.body.data.setWebhook.webhook.url).to.eql(webhookUrl);
                (0, chai_1.expect)(res.body.data.setWebhook.webhook.eventTypes).to.eql(eventTypes);
                (0, chai_1.expect)(res.body.data.setWebhook.webhook.enabled).to.be.true;
            });
            it('should throw when webhook is local ip', async () => {
                const localQuery = `
        mutation {
          setWebhook(
            input: {
              url: "http://127.0.0.1",
              eventTypes: [${eventTypes.toString()}],
              enabled: ${enabled.toString()}
            }
          ) {
            ... on SetWebhookSuccess {
              webhook {
                id
                url
                eventTypes
                enabled
              }
            }
            ... on SetWebhookError {
              errorCodes
            }
          }
        }`;
                const res = await (0, util_1.graphqlRequest)(localQuery, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.setWebhook.errorCodes).to.eql(['BAD_REQUEST']);
            });
        });
        context('when id is there', () => {
            before(async () => {
                const webhook = await (0, webhook_1.createWebhook)({
                    url: 'http://localhost:3000/webhooks/test',
                    user: { id: user.id },
                    eventTypes: [graphql_1.WebhookEvent.HighlightUpdated],
                }, user.id);
                webhookId = webhook.id;
                webhookUrl = 'http://localhost:3000/webhooks/test_2';
                eventTypes = [
                    graphql_1.WebhookEvent.HighlightUpdated,
                    graphql_1.WebhookEvent.HighlightCreated,
                ];
                enabled = false;
            });
            it('should update a webhook', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.setWebhook.webhook).to.be.an('object');
                (0, chai_1.expect)(res.body.data.setWebhook.webhook.url).to.eql(webhookUrl);
                (0, chai_1.expect)(res.body.data.setWebhook.webhook.eventTypes).to.eql(eventTypes);
                (0, chai_1.expect)(res.body.data.setWebhook.webhook.enabled).to.be.false;
            });
        });
    });
    describe('Delete webhook', () => {
        let query;
        let webhookId;
        beforeEach(() => {
            query = `
        mutation {
          deleteWebhook(id: "${webhookId}") {
            ... on DeleteWebhookSuccess {
              webhook {
                id
              }
            }
            ... on DeleteWebhookError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when webhook exists', () => {
            before(async () => {
                const webhook = await (0, webhook_1.createWebhook)({
                    url: 'http://localhost:3000/webhooks/test',
                    user: { id: user.id },
                    eventTypes: [graphql_1.WebhookEvent.LabelCreated],
                }, user.id);
                webhookId = webhook.id;
            });
            it('should delete a webhook', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const webhook = await (0, webhook_1.findWebhookById)(webhookId, user.id);
                (0, chai_1.expect)(res.body.data.deleteWebhook.webhook).to.be.an('object');
                (0, chai_1.expect)(res.body.data.deleteWebhook.webhook.id).to.eql(webhookId);
                (0, chai_1.expect)(webhook).to.be.null;
            });
        });
    });
});
