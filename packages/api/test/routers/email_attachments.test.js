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
const newsletter_email_1 = require("../../src/entity/newsletter_email");
const repository_1 = require("../../src/repository");
const library_item_1 = require("../../src/services/library_item");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
xdescribe('Email attachments Router', () => {
    const newsletterEmailAddress = 'fakeEmail@omnivore.work';
    let user;
    let authToken;
    before(async () => {
        // create test user and login
        user = await (0, db_1.createTestUser)('fakeUser');
        await (0, repository_1.getRepository)(newsletter_email_1.NewsletterEmail).save({
            address: newsletterEmailAddress,
            user: { id: user.id },
        });
        authToken = jwt.sign(newsletterEmailAddress, process.env.JWT_SECRET || '');
    });
    after(async () => {
        // clean up
        await (0, user_1.deleteUser)(user.id);
        sinon_1.default.restore();
    });
    describe('upload', () => {
        it('create upload file request and return id and url', async () => {
            const testFile = 'testFile.pdf';
            const res = await util_1.request
                .post('/svc/email-attachment/upload')
                .set('Authorization', `${authToken}`)
                .send({
                email: newsletterEmailAddress,
                fileName: testFile,
                contentType: 'application/pdf',
            })
                .expect(200);
            (0, chai_1.expect)(res.body.id).to.be.a('string');
            (0, chai_1.expect)(res.body.url).to.be.a('string');
        });
    });
    describe('create article', () => {
        let uploadFileId;
        before(async () => {
            // upload file first
            const testFile = 'testFile.pdf';
            const res = await util_1.request
                .post('/svc/email-attachment/upload')
                .set('Authorization', `${authToken}`)
                .send({
                email: newsletterEmailAddress,
                fileName: testFile,
                contentType: 'application/pdf',
            });
            uploadFileId = res.body.id;
        });
        it('create article with uploaded file id and url', async () => {
            // create article
            const res2 = await util_1.request
                .post('/svc/email-attachment/create-article')
                .send({
                email: newsletterEmailAddress,
                uploadFileId,
            })
                .set('Authorization', `${authToken}`)
                .expect(200);
            (0, chai_1.expect)(res2.body.id).to.be.a('string');
            const item = await (0, library_item_1.findLibraryItemById)(res2.body.id, user.id);
            (0, chai_1.expect)(item).to.exist;
            (0, chai_1.expect)(item?.contentReader).to.eq('PDF');
        });
    });
});
