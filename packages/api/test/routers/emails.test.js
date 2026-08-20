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
const chai_1 = require("chai");
const jwt = __importStar(require("jsonwebtoken"));
require("mocha");
const sinon_1 = __importDefault(require("sinon"));
const newsletters_1 = require("../../src/services/newsletters");
const received_emails_1 = require("../../src/services/received_emails");
const user_1 = require("../../src/services/user");
const parser = __importStar(require("../../src/utils/parser"));
const sendEmail = __importStar(require("../../src/utils/sendEmail"));
const sendNotification = __importStar(require("../../src/utils/sendNotification"));
const db_1 = require("../db");
const util_1 = require("../util");
describe('Emails Router', () => {
    const from = 'fake from';
    const subject = 'fake subject';
    const text = 'fake text';
    let user;
    let token;
    let receivedEmail;
    let newsletterEmail;
    let authToken;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        newsletterEmail = await (0, newsletters_1.createNewsletterEmail)(user.id);
        token = process.env.PUBSUB_VERIFICATION_TOKEN || '';
        receivedEmail = await (0, received_emails_1.saveReceivedEmail)(from, newsletterEmail.address, subject, text, '', user.id, 'non-article');
        authToken = jwt.sign(user.id, process.env.JWT_SECRET || '');
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
        sinon_1.default.restore();
    });
    describe('forward', () => {
        const html = '<html>test html</html>';
        beforeEach(() => {
            sinon_1.default.replace(sendNotification, 'sendMulticastPushNotifications', sinon_1.default.fake.resolves(undefined));
            sinon_1.default.replace(sendEmail, 'sendEmail', sinon_1.default.fake.resolves(true));
        });
        afterEach(() => {
            sinon_1.default.restore();
        });
        context('when email is an article', () => {
            before(() => {
                sinon_1.default.replace(parser, 'isProbablyArticle', sinon_1.default.fake.resolves(true));
            });
            it('saves the email as an article', async () => {
                const data = {
                    message: {
                        data: Buffer.from(JSON.stringify({
                            from,
                            to: newsletterEmail.address,
                            subject,
                            html,
                            text,
                            receivedEmailId: receivedEmail.id,
                        })).toString('base64'),
                        publishTime: new Date().toISOString(),
                    },
                };
                const res = await util_1.request
                    .post(`/svc/pubsub/emails/forward?token=${token}`)
                    .send(data)
                    .expect(200);
                (0, chai_1.expect)(res.text).to.eql('Article');
            });
        });
        context('when email is a regular email', () => {
            before(() => {
                sinon_1.default.replace(parser, 'isProbablyArticle', sinon_1.default.fake.resolves(false));
            });
            it('forwards the email', async () => {
                const data = {
                    message: {
                        data: Buffer.from(JSON.stringify({
                            from,
                            to: newsletterEmail.address,
                            subject,
                            html,
                            text,
                            receivedEmailId: receivedEmail.id,
                        })).toString('base64'),
                        publishTime: new Date().toISOString(),
                    },
                };
                const res = await util_1.request
                    .post(`/svc/pubsub/emails/forward?token=${token}`)
                    .send(data)
                    .expect(200);
                (0, chai_1.expect)(res.text).to.eql('Email forwarded');
            });
        });
    });
    describe('create', () => {
        const url = '/svc/pubsub/emails/save';
        const html = '<html>test html</html>';
        const text = 'test text';
        const from = 'fake from';
        const subject = 'fake subject';
        it('saves the email in the database', async () => {
            const data = {
                html,
                text,
                from,
                to: newsletterEmail.address,
                subject,
            };
            const res = await util_1.request
                .post(url)
                .set('Authorization', `${authToken}`)
                .send(data)
                .expect(200);
            (0, chai_1.expect)(res.body.id).not.to.be.undefined;
        });
        it('saves the email if body is empty', async () => {
            const data = {
                from,
                to: newsletterEmail.address,
                subject,
            };
            const res = await util_1.request
                .post(url)
                .set('Authorization', `${authToken}`)
                .send(data)
                .expect(200);
            (0, chai_1.expect)(res.body.id).not.to.be.undefined;
        });
        it('saves the email if subject is empty', async () => {
            const data = {
                from,
                to: newsletterEmail.address,
                html,
            };
            const res = await util_1.request
                .post(url)
                .set('Authorization', `${authToken}`)
                .send(data)
                .expect(200);
            (0, chai_1.expect)(res.body.id).not.to.be.undefined;
        });
    });
});
