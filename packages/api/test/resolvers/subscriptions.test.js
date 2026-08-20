"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importStar(require("chai"));
require("mocha");
const rss_parser_1 = __importDefault(require("rss-parser"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const newsletter_email_1 = require("../../src/entity/newsletter_email");
const subscription_1 = require("../../src/entity/subscription");
const graphql_1 = require("../../src/generated/graphql");
const repository_1 = require("../../src/repository");
const newsletters_1 = require("../../src/services/newsletters");
const subscriptions_1 = require("../../src/services/subscriptions");
const user_1 = require("../../src/services/user");
const sendEmail = __importStar(require("../../src/utils/sendEmail"));
const db_1 = require("../db");
const util_1 = require("../util");
chai_1.default.use(sinon_chai_1.default);
describe('Subscriptions API', () => {
    let user;
    let authToken;
    let subscriptions;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        // create test newsletter subscriptions
        const newsletterEmail = await (0, newsletters_1.createNewsletterEmail)(user.id);
        //  create testing newsletter subscriptions
        const sub1 = await (0, subscriptions_1.createSubscription)(user.id, 'sub_1', newsletterEmail);
        const sub2 = await (0, subscriptions_1.createSubscription)(user.id, 'sub_2', newsletterEmail);
        // create a unsubscribed subscription
        await (0, subscriptions_1.createSubscription)(user.id, 'sub_3', newsletterEmail, graphql_1.SubscriptionStatus.Unsubscribed);
        // create an rss feed subscription
        const sub4 = await (0, subscriptions_1.createSubscription)(user.id, 'sub_4', undefined, graphql_1.SubscriptionStatus.Active, undefined, graphql_1.SubscriptionType.Rss);
        subscriptions = [sub4, sub2, sub1];
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('GET subscriptions', () => {
        let query;
        beforeEach(() => {
            query = `
        query {
          subscriptions {
            ... on SubscriptionsSuccess {
              subscriptions {
                id
                name
              }
            }
            ... on SubscriptionsError {
              errorCodes
            }
          }
        }
      `;
        });
        it('should return subscriptions', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.subscriptions.subscriptions).to.eql(subscriptions.map((sub) => ({
                id: sub.id,
                name: sub.name,
            })));
        });
        it('should return only newsletters when type newsletter supplied', async () => {
            query = `
        query {
          subscriptions(type: NEWSLETTER) {
            ... on SubscriptionsSuccess {
              subscriptions {
                id
                name
              }
            }
            ... on SubscriptionsError {
              errorCodes
            }
          }
        }
      `;
            const newsletters = subscriptions.filter((s) => s.type == graphql_1.SubscriptionType.Newsletter);
            const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
            (0, chai_1.expect)(res.body.data.subscriptions.subscriptions).to.eql(newsletters.map((sub) => ({
                id: sub.id,
                name: sub.name,
            })));
        });
        it('should not return inactive newsletters but should return inactive RSS', async () => {
            const sub5 = await (0, subscriptions_1.createSubscription)(user.id, 'sub_5', undefined, graphql_1.SubscriptionStatus.Unsubscribed, undefined, graphql_1.SubscriptionType.Rss);
            try {
                await (0, subscriptions_1.createSubscription)(user.id, 'sub_6', undefined, graphql_1.SubscriptionStatus.Unsubscribed, undefined, graphql_1.SubscriptionType.Newsletter);
                const allSubscriptions = [...subscriptions, sub5];
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.subscriptions.subscriptions).to.eql(allSubscriptions.map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                })));
            }
            finally {
                await (0, repository_1.getRepository)(subscription_1.Subscription).remove(sub5);
            }
        });
        it('should not return other users subscriptions', async () => {
            // create test user and login
            const user2 = await (0, db_1.createTestUser)('fakeUser2');
            try {
                await (0, subscriptions_1.createSubscription)(user2.id, 'sub_other', undefined, graphql_1.SubscriptionStatus.Unsubscribed, undefined, graphql_1.SubscriptionType.Rss);
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.subscriptions.subscriptions).to.eql(subscriptions.map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                })));
            }
            finally {
                await (0, user_1.deleteUser)(user2.id);
            }
        });
        it('should not return other users subscriptions when type is set to RSS', async () => {
            query = `
      query {
        subscriptions(type: RSS) {
          ... on SubscriptionsSuccess {
            subscriptions {
              id
              name
            }
          }
          ... on SubscriptionsError {
            errorCodes
          }
        }
      }
    `;
            const user3 = await (0, db_1.createTestUser)('fakeUser3');
            try {
                await (0, subscriptions_1.createSubscription)(user3.id, 'sub_other', undefined, graphql_1.SubscriptionStatus.Unsubscribed, undefined, graphql_1.SubscriptionType.Rss);
                const rssItems = subscriptions.filter((s) => s.type == graphql_1.SubscriptionType.Rss);
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.subscriptions.subscriptions).to.eql(rssItems.map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                })));
            }
            finally {
                await (0, user_1.deleteUser)(user3.id);
            }
        });
        it('should not return other users subscriptions when type is set to NEWSLETTER', async () => {
            query = `
      query {
        subscriptions(type: NEWSLETTER) {
          ... on SubscriptionsSuccess {
            subscriptions {
              id
              name
            }
          }
          ... on SubscriptionsError {
            errorCodes
          }
        }
      }
    `;
            const user2 = await (0, db_1.createTestUser)('fakeUser2');
            try {
                await (0, subscriptions_1.createSubscription)(user2.id, 'sub_other', undefined, graphql_1.SubscriptionStatus.Unsubscribed, undefined, graphql_1.SubscriptionType.Rss);
                const newsletters = subscriptions.filter((s) => s.type == graphql_1.SubscriptionType.Newsletter);
                const res = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(res.body.data.subscriptions.subscriptions).to.eql(newsletters.map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                })));
            }
            finally {
                await (0, user_1.deleteUser)(user2.id);
            }
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        query {
          subscriptions {}
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Unsubscribe', () => {
        const query = (name) => `
      mutation {
        unsubscribe(name: "${name}") {
          ... on UnsubscribeSuccess {
            subscription {
              id
            }
          }
          ... on UnsubscribeError {
            errorCodes
          }
        }
      }
    `;
        it('unsubscribes', async () => {
            const name = 'Sub_5';
            const to = 'unsubscribe@omnivore.work';
            const subject = 'test';
            // create test newsletter subscriptions
            const newsletterEmail = await (0, repository_1.getRepository)(newsletter_email_1.NewsletterEmail).save({
                user,
                address: 'test_2@inbox.omnivore.work',
                confirmationCode: 'test',
            });
            const subscription = await (0, subscriptions_1.createSubscription)(user.id, name, newsletterEmail, graphql_1.SubscriptionStatus.Active, `${to}?subject=${subject}`);
            // fake sendEmail function
            const fake = sinon_1.default.replace(sendEmail, 'sendEmail', sinon_1.default.fake.resolves(true));
            const res = await (0, util_1.graphqlRequest)(query(name), authToken).expect(200);
            (0, chai_1.expect)(res.body.data.unsubscribe.subscription).to.eql({
                id: subscription.id,
            });
            const updatedSubscription = await (0, repository_1.getRepository)(subscription_1.Subscription).findOneBy({
                id: subscription.id,
            });
            (0, chai_1.expect)(updatedSubscription?.status).to.eql(graphql_1.SubscriptionStatus.Unsubscribed);
            // check if the email was sent
            (0, chai_1.expect)(fake).to.have.been.calledOnceWith({
                to,
                subject,
                text: subscriptions_1.UNSUBSCRIBE_EMAIL_TEXT,
                from: newsletterEmail.address,
            });
            sinon_1.default.restore();
            // clean up
            await (0, repository_1.getRepository)(subscription_1.Subscription).remove(subscription);
        });
    });
    describe('Subscribe API', () => {
        const query = `
      mutation Subscribe($input: SubscribeInput!){
        subscribe(input: $input) {
          ... on SubscribeSuccess {
            subscriptions {
              id
              createdAt
            }
          }
          ... on SubscribeError {
            errorCodes
          }
        }
      }
    `;
        context('when subscribing to a rss feed', () => {
            const url = 'https://www.omnivore.work/rss';
            const subscriptionType = graphql_1.SubscriptionType.Rss;
            before(() => {
                // fake rss parser
                sinon_1.default.replace(rss_parser_1.default.prototype, 'parseURL', sinon_1.default.fake.resolves({
                    title: 'RSS Feed',
                    description: 'RSS Feed Description',
                    feedUrl: url,
                }));
            });
            after(() => {
                sinon_1.default.restore();
            });
            context('when the user is subscribed to the feed', () => {
                let existingSubscription;
                before(async () => {
                    existingSubscription = await (0, subscriptions_1.createSubscription)(user.id, 'RSS Feed', undefined, graphql_1.SubscriptionStatus.Active, url, subscriptionType, url);
                });
                after(async () => {
                    await (0, subscriptions_1.deleteSubscription)(existingSubscription.id);
                });
                it('returns an error', async () => {
                    const res = await (0, util_1.graphqlRequest)(query, authToken, {
                        input: { url, subscriptionType },
                    }).expect(200);
                    (0, chai_1.expect)(res.body.data.subscribe.errorCodes).to.eql([
                        'ALREADY_SUBSCRIBED',
                    ]);
                });
            });
            context('when the user unsubscribed the feed', () => {
                let existingSubscription;
                before(async () => {
                    existingSubscription = await (0, subscriptions_1.createSubscription)(user.id, 'RSS Feed', undefined, graphql_1.SubscriptionStatus.Unsubscribed, url, subscriptionType, url);
                });
                after(async () => {
                    await (0, subscriptions_1.deleteSubscription)(existingSubscription.id);
                });
                it('re-subscribes the user', async () => {
                    const res = await (0, util_1.graphqlRequest)(query, authToken, {
                        input: { url, subscriptionType },
                    }).expect(200);
                    (0, chai_1.expect)(res.body.data.subscribe.subscriptions).to.have.lengthOf(1);
                    (0, chai_1.expect)(res.body.data.subscribe.subscriptions[0].id).to.be.a('string');
                });
            });
            it('creates a rss subscription', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { url, subscriptionType },
                }).expect(200);
                (0, chai_1.expect)(res.body.data.subscribe.subscriptions).to.have.lengthOf(1);
                (0, chai_1.expect)(res.body.data.subscribe.subscriptions[0].id).to.be.a('string');
                // clean up
                await (0, subscriptions_1.deleteSubscription)(res.body.data.subscribe.subscriptions[0].id);
            });
            it('throws an error when referencing a local ip', async () => {
                const res = await (0, util_1.graphqlRequest)(query, authToken, {
                    input: { url: 'http://127.0.0.1', subscriptionType },
                }).expect(200);
                (0, chai_1.expect)(res.body.data.subscription.errorCodes).to.eql(['BAD_REQUEST']);
            });
        });
    });
    describe('Get Subscription', () => {
        const query = `
      query Subscription($id: ID!) {
        subscription(id: $id) {
          ... on SubscriptionSuccess {
            subscription {
              id
              name
            }
          }
          ... on SubscriptionError {
            errorCodes
          }
        }
      }
    `;
        let existingSubscription;
        before(async () => {
            // create test newsletter subscriptions
            const newsletterEmail = await (0, newsletters_1.createNewsletterEmail)(user.id);
            existingSubscription = await (0, subscriptions_1.createSubscription)(user.id, 'sub_1', newsletterEmail);
        });
        after(async () => {
            await (0, subscriptions_1.deleteSubscription)(existingSubscription.id);
        });
        it('returns the subscription', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken, {
                id: existingSubscription.id,
            }).expect(200);
            (0, chai_1.expect)(res.body.data.subscription.subscription).to.eql({
                id: existingSubscription.id,
                name: existingSubscription.name,
            });
        });
        it('returns an error when the subscription does not exist', async () => {
            const res = await (0, util_1.graphqlRequest)(query, authToken, {
                id: (0, util_1.generateFakeUuid)(),
            }).expect(200);
            (0, chai_1.expect)(res.body.data.subscription.errorCodes).to.eql(['NOT_FOUND']);
        });
    });
});
