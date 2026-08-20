"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const nock_1 = __importDefault(require("nock"));
const library_item_1 = require("../../src/services/library_item");
const received_emails_1 = require("../../src/services/received_emails");
const save_email_1 = require("../../src/services/save_email");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
describe('saveEmail', () => {
    const fakeContent = 'fake content';
    let user;
    let scope;
    let receivedEmail;
    before(async () => {
        // create test user
        user = await (0, db_1.createTestUser)('fakeUser');
        scope = (0, nock_1.default)('https://blog.omnivore.work')
            .get('/fake-url')
            .reply(200)
            .persist();
        receivedEmail = await (0, received_emails_1.saveReceivedEmail)('', '', '', '', '', user.id, 'non-article');
    });
    after(async () => {
        await (0, user_1.deleteUser)(user.id);
        scope.persist(false);
    });
    it('doesnt fail if saved twice', async () => {
        const url = 'https://blog.omnivore.work/fake-url';
        const title = 'fake title';
        const author = 'fake author';
        await (0, save_email_1.saveEmail)({
            originalContent: `<html><body>${fakeContent}</body></html>`,
            url,
            title,
            author,
            userId: user.id,
            receivedEmailId: receivedEmail.id,
        });
        // This ensures row level security doesnt prevent
        // saving the same URL
        const secondResult = await (0, save_email_1.saveEmail)({
            originalContent: `<html><body>${fakeContent}</body></html>`,
            url,
            title,
            author,
            userId: user.id,
            receivedEmailId: receivedEmail.id,
        });
        (0, chai_1.expect)(secondResult).to.not.be.undefined;
        const item = await (0, library_item_1.findLibraryItemByUrl)(url, user.id);
        (0, chai_1.expect)(item).to.exist;
        (0, chai_1.expect)(item?.originalUrl).to.equal(url);
        (0, chai_1.expect)(item?.title).to.equal(title);
        (0, chai_1.expect)(item?.author).to.equal(author);
        (0, chai_1.expect)(item?.readableContent).to.contain(fakeContent);
    });
});
