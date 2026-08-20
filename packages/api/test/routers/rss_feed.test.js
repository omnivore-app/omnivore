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
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const graphql_1 = require("../../src/generated/graphql");
const refreshAllFeeds = __importStar(require("../../src/jobs/rss/refreshAllFeeds"));
const subscriptions_1 = require("../../src/services/subscriptions");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
chai_1.default.use(sinon_chai_1.default);
describe('Rss feeds Router', () => {
    const token = process.env.PUBSUB_VERIFICATION_TOKEN || '';
    let user;
    let user1;
    let user2;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        user1 = await (0, db_1.createTestUser)('fakeUser1');
        user2 = await (0, db_1.createTestUser)('fakeUser2');
        // create test subscriptions
        const name1 = 'NPR';
        const url1 = 'https://www.npr.org/rss/rss.php?id=1001';
        const name2 = 'BBC';
        const url2 = 'http://feeds.bbci.co.uk/news/rss.xml';
        await (0, subscriptions_1.createRssSubscriptions)([
            {
                name: name1,
                user: { id: user1.id },
                scheduledAt: new Date(),
                url: url1,
                type: graphql_1.SubscriptionType.Rss,
            },
            {
                name: name1,
                user: { id: user2.id },
                scheduledAt: new Date(),
                url: url1,
                type: graphql_1.SubscriptionType.Rss,
            },
            {
                name: name2,
                user: { id: user1.id },
                url: url2,
                type: graphql_1.SubscriptionType.Rss,
            },
            {
                name: name2,
                user: { id: user2.id },
                // 1 hour in the future
                scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
                url: url2,
                type: graphql_1.SubscriptionType.Rss,
            },
        ]);
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
        await (0, user_1.deleteUser)(user1.id);
        await (0, user_1.deleteUser)(user2.id);
    });
    it('fetches all scheduled RSS feeds', async () => {
        const data = {
            message: {
                data: Buffer.from('').toString('base64'),
                publishTime: new Date().toISOString(),
            },
        };
        // fake queueRSSRefreshAllFeedsJob function
        const fake = sinon_1.default.replace(refreshAllFeeds, 'queueRSSRefreshAllFeedsJob', sinon_1.default.fake());
        const res = await util_1.request
            .post('/svc/pubsub/rss-feed/fetchAll?token=' + token)
            .send(data)
            .expect(200);
        (0, chai_1.expect)(res.text).to.eql('OK');
        // check if enqueueRssFeedFetch is called
        (0, chai_1.expect)(fake).to.have.been.called;
        sinon_1.default.restore();
    });
});
