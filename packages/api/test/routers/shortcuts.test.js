"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const uuid_1 = require("uuid");
const user_personalization_1 = require("../../src/services/user_personalization");
describe('Shortcuts Router', () => {
    const token = process.env.PUBSUB_VERIFICATION_TOKEN || '';
    let user;
    describe('default', () => {
        before(async () => {
            user = await (0, db_1.createTestUser)('fakeUser');
        });
        after(async () => {
            await (0, user_1.deleteUser)(user.id);
        });
        it('gets the default shortcuts', async () => {
            const shortcuts = await (0, user_personalization_1.getShortcuts)(user.id);
            (0, chai_1.expect)(shortcuts.length).to.eq(3); // labels, subscriptions, searches
        });
        it('can set the shortcuts', async () => {
            const shortcuts = await (0, user_personalization_1.setShortcuts)(user.id, [
                {
                    id: (0, uuid_1.v4)(),
                    type: 'folder',
                    section: 'library',
                    name: 'test folder',
                },
            ]);
            const result = await (0, user_personalization_1.getShortcuts)(user.id);
            (0, chai_1.expect)(result.length).to.eq(1);
        });
        it('can modify shortcuts', async () => {
            await (0, user_personalization_1.setShortcuts)(user.id, [
                {
                    id: (0, uuid_1.v4)(),
                    type: 'folder',
                    section: 'library',
                    name: 'test folder',
                },
            ]);
            await (0, user_personalization_1.setShortcuts)(user.id, [
                {
                    id: (0, uuid_1.v4)(),
                    type: 'folder',
                    section: 'library',
                    name: 'test folder',
                },
                {
                    id: (0, uuid_1.v4)(),
                    type: 'folder',
                    section: 'library',
                    name: 'test folder 2',
                },
            ]);
            const result = await (0, user_personalization_1.getShortcuts)(user.id);
            (0, chai_1.expect)(result.length).to.eq(2);
        });
    });
});
