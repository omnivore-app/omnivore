"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const nock_1 = __importDefault(require("nock"));
const user_1 = require("../../src/services/user");
const webhook_1 = require("../../src/services/webhook");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Webhooks Router', () => {
    const token = process.env.PUBSUB_VERIFICATION_TOKEN || '';
    const webhookBaseUrl = 'https://localhost:3000';
    const webhookPath = `/webhooks`;
    let user;
    let webhook;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        webhook = await (0, webhook_1.createWebhook)({
            url: webhookBaseUrl + webhookPath,
            user: { id: user.id },
            eventTypes: ['PAGE_CREATED'],
        }, user.id);
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('trigger webhooks', () => {
        it('should trigger webhooks', async () => {
            const data = {
                message: {
                    data: Buffer.from(JSON.stringify({ userId: user.id, type: 'page' })).toString('base64'),
                    publishTime: new Date().toISOString(),
                },
            };
            (0, nock_1.default)(webhookBaseUrl).post(webhookPath).reply(200);
            const res = await util_1.request
                .post('/svc/pubsub/webhooks/trigger/created?token=' + token)
                .send(data)
                .expect(200);
            (0, chai_1.expect)(res.text).to.eql('OK');
        });
    });
});
