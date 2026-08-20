"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const nock_1 = __importDefault(require("nock"));
const subscription_1 = require("../../src/entity/subscription");
const repository_1 = require("../../src/repository");
const library_item_1 = require("../../src/services/library_item");
const newsletters_1 = require("../../src/services/newsletters");
const received_emails_1 = require("../../src/services/received_emails");
const save_newsletter_email_1 = require("../../src/services/save_newsletter_email");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
describe('saveNewsletterEmail', () => {
    const fakeContent = 'fake content';
    const title = 'fake title';
    const author = 'fake author';
    const from = 'fake from';
    const text = 'fake text';
    let user;
    let newsletterEmail;
    let receivedEmail;
    before(async () => {
        user = await (0, db_1.createTestUser)('fakeUser');
        newsletterEmail = await (0, newsletters_1.createNewsletterEmail)(user.id);
        receivedEmail = await (0, received_emails_1.saveReceivedEmail)(from, newsletterEmail.address, title, text, '', user.id, 'non-article');
    });
    after(async () => {
        await (0, user_1.deleteUser)(user.id);
    });
    it('adds the newsletter to the library', async () => {
        (0, nock_1.default)('https://blog.omnivore.work').get('/fake-url').reply(200);
        (0, nock_1.default)('https://blog.omnivore.work').head('/fake-url').reply(200);
        const url = 'https://blog.omnivore.work/fake-url';
        await (0, save_newsletter_email_1.saveNewsletter)({
            from,
            email: newsletterEmail.address,
            content: `<html><body>${fakeContent}</body></html>`,
            url,
            title,
            author,
            receivedEmailId: receivedEmail.id,
            unsubHttpUrl: 'https://blog.omnivore.work/unsubscribe',
        }, newsletterEmail);
        const item = await (0, library_item_1.findLibraryItemByUrl)(url, user.id);
        (0, chai_1.expect)(item).to.exist;
        (0, chai_1.expect)(item?.originalUrl).to.equal(url);
        (0, chai_1.expect)(item?.title).to.equal(title);
        (0, chai_1.expect)(item?.author).to.equal(author);
        (0, chai_1.expect)(item?.readableContent).to.contain(fakeContent);
        const subscriptions = await (0, repository_1.getRepository)(subscription_1.Subscription).findBy({
            newsletterEmail: { id: newsletterEmail.id },
        });
        (0, chai_1.expect)(subscriptions).not.to.be.empty;
    });
    it('adds a Newsletter label to that page', async () => {
        (0, nock_1.default)('https://blog.omnivore.work').get('/new-fake-url').reply(200);
        (0, nock_1.default)('https://blog.omnivore.work').head('/new-fake-url').reply(200);
        const url = 'https://blog.omnivore.work/new-fake-url';
        const newLabel = {
            name: 'Newsletter',
            color: '#07D2D1',
        };
        await (0, save_newsletter_email_1.saveNewsletter)({
            email: newsletterEmail.address,
            content: `<html><body>fake content 2</body></html>`,
            url,
            title,
            author,
            from,
            receivedEmailId: receivedEmail.id,
        }, newsletterEmail);
        const item = await (0, library_item_1.findLibraryItemByUrl)(url, user.id);
        (0, chai_1.expect)(item?.labels?.[0]).to.deep.include(newLabel);
    });
    it('does not create a subscription if no unsubscribe header', async () => {
        const url = 'https://omnivore.work/no_url?q=no-unsubscribe';
        (0, nock_1.default)('https://omnivore.work').get('/no_url?q=no-unsubscribe').reply(404);
        await (0, save_newsletter_email_1.saveNewsletter)({
            email: newsletterEmail.address,
            content: `<html><body>fake content 2</body></html>`,
            url,
            title,
            author,
            from,
            receivedEmailId: receivedEmail.id,
        }, newsletterEmail);
        const subscriptions = await (0, repository_1.getRepository)(subscription_1.Subscription).findBy({
            newsletterEmail: { id: newsletterEmail.id },
            name: from,
        });
        (0, chai_1.expect)(subscriptions).to.be.empty;
    });
});
