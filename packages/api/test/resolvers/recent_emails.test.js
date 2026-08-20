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
require("mocha");
const sinon_1 = __importDefault(require("sinon"));
const newsletter_email_1 = require("../../src/entity/newsletter_email");
const repository_1 = require("../../src/repository");
const received_emails_1 = require("../../src/services/received_emails");
const user_1 = require("../../src/services/user");
const sendEmail = __importStar(require("../../src/utils/sendEmail"));
const db_1 = require("../db");
const util_1 = require("../util");
describe('Recent Emails Resolver', () => {
    const recentEmailsQuery = `
  query {
    recentEmails {
      ... on RecentEmailsSuccess {
        recentEmails {
          id
          from
          to
          subject
          text
          html
        }
      }
      ... on RecentEmailsError {
        errorCodes
      }
    }
  }
`;
    let recentEmails;
    const username = 'fakeUser';
    let user;
    let authToken;
    let newsletterEmail;
    let newsletterEmail2;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)(username);
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        // create test newsletter email
        newsletterEmail = await (0, repository_1.getRepository)(newsletter_email_1.NewsletterEmail).save({
            user: { id: user.id },
            address: 'fake email address',
        });
        newsletterEmail2 = await (0, repository_1.getRepository)(newsletter_email_1.NewsletterEmail).save({
            user: { id: user.id },
            address: 'fake email address 2',
        });
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
    });
    describe('recentEmails', () => {
        before(async () => {
            // create fake emails
            const recentEmail = await (0, received_emails_1.saveReceivedEmail)('fake from', newsletterEmail.address, 'fake subject', 'fake text', 'fake html', user.id, 'article');
            const recentEmail2 = await (0, received_emails_1.saveReceivedEmail)('fake from 2', newsletterEmail2.address, 'fake subject 2', 'fake text 2', 'fake html 2', user.id, 'non-article');
            recentEmails = [recentEmail, recentEmail2];
        });
        it('returns recent emails', async () => {
            const res = await (0, util_1.graphqlRequest)(recentEmailsQuery, authToken).expect(200);
            const { recentEmails: results } = res.body.data.recentEmails;
            (0, chai_1.expect)(results).to.have.lengthOf(2);
            (0, chai_1.expect)(results[0].id).to.eql(recentEmails[1].id);
            (0, chai_1.expect)(results[1].id).to.eql(recentEmails[0].id);
        });
    });
    describe('markEmailAsItem', () => {
        const markEmailAsItemMutation = (recentEmailId) => `
      mutation {
        markEmailAsItem(recentEmailId: "${recentEmailId}") {
          ... on MarkEmailAsItemSuccess {
            success
          }
          ... on MarkEmailAsItemError {
            errorCodes
          }
        }
      }
    `;
        let recentEmail;
        before(async () => {
            // create fake email
            recentEmail = await (0, received_emails_1.saveReceivedEmail)('Omnivore Newsletter <newsletter@omnivore.work>', newsletterEmail.address, 'fake subject 3', 'fake text 3', 'fake html 3', user.id, 'non-article');
            sinon_1.default.replace(sendEmail, 'sendEmail', sinon_1.default.fake.resolves(true));
        });
        after(async () => {
            // clean up
            await (0, received_emails_1.deleteReceivedEmail)(recentEmail.id, user.id);
            sinon_1.default.restore();
        });
        it('marks email as item', async () => {
            const resp = await (0, util_1.graphqlRequest)(markEmailAsItemMutation(recentEmail.id), authToken);
            (0, chai_1.expect)(resp.body.data.markEmailAsItem.success).to.be.true;
            const updatedRecentEmail = await (0, received_emails_1.findReceivedEmailById)(recentEmail.id, user.id);
            (0, chai_1.expect)(updatedRecentEmail?.type).to.eql('article');
        });
    });
    describe('old recentEmails are cleared', () => {
        let user2;
        let user3;
        let user2Auth;
        before(async () => {
            user2 = await (0, db_1.createTestUser)('fake_02');
            user3 = await (0, db_1.createTestUser)('fake_03');
            const res = await util_1.request
                .post('/local/debug/fake-user-login')
                .send({ fakeEmail: user2.email });
            user2Auth = res.body.authToken;
        });
        after(async () => {
            await (0, user_1.deleteUser)(user2.id);
            await (0, user_1.deleteUser)(user3.id);
        });
        before(async () => {
            // create fake emails
            const recentEmail = await (0, received_emails_1.saveReceivedEmail)('fake from 4', newsletterEmail.address, 'fake subject 4', 'fake text 4', 'fake html 4', user2.id, 'article');
            const recentEmail2 = await (0, received_emails_1.saveReceivedEmail)('fake from 4', newsletterEmail.address, 'fake subject 4', 'fake text 4', 'fake html 4', user2.id, 'non-article');
            recentEmails = [recentEmail, recentEmail2];
        });
        it('when a second user receives an email the firsts are not deleted', async () => {
            const res = await (0, util_1.graphqlRequest)(recentEmailsQuery, user2Auth).expect(200);
            const { recentEmails: results } = res.body.data.recentEmails;
            (0, chai_1.expect)(results).to.have.lengthOf(2);
            (0, chai_1.expect)(results[0].id).to.eql(recentEmails[1].id);
            (0, chai_1.expect)(results[1].id).to.eql(recentEmails[0].id);
            await (0, received_emails_1.saveReceivedEmail)('fake from 5', newsletterEmail.address, 'fake subject 5', 'fake text 5', 'fake html 5', user3.id, 'article');
            const res2 = await (0, util_1.graphqlRequest)(recentEmailsQuery, user2Auth).expect(200);
            const { recentEmails: results2 } = res2.body.data.recentEmails;
            (0, chai_1.expect)(results2).to.have.lengthOf(2);
            (0, chai_1.expect)(results2[0].id).to.eql(recentEmails[1].id);
            (0, chai_1.expect)(results2[1].id).to.eql(recentEmails[0].id);
        });
    });
});
