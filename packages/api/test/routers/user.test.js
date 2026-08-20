"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const typeorm_1 = require("typeorm");
const user_1 = require("../../src/entity/user");
const user_2 = require("../../src/services/user");
const util_1 = require("../util");
describe('User Service Router', () => {
    const token = process.env.PUBSUB_VERIFICATION_TOKEN || '';
    describe('prune', () => {
        let toDeleteUserIds = [];
        before(async () => {
            // create test users
            const users = await (0, user_2.createUsers)([
                {
                    name: 'user_1',
                    email: 'user_1@omnivore.work',
                    status: user_1.StatusType.Deleted,
                    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
                    source: 'GOOGLE',
                    sourceUserId: '123',
                },
                {
                    name: 'user_2',
                    email: 'user_2@omnivore.work',
                    status: user_1.StatusType.Deleted,
                    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
                    source: 'GOOGLE',
                    sourceUserId: '456',
                },
            ]);
            toDeleteUserIds = users.map((u) => u.id);
        });
        after(async () => {
            // delete test users
            await (0, user_2.deleteUsers)({ id: (0, typeorm_1.In)(toDeleteUserIds) });
        });
        it('prunes soft deleted users a day ago', async () => {
            const data = {
                message: {
                    data: Buffer.from(JSON.stringify({ subDays: 1 }) // 1 day ago
                    ).toString('base64'),
                    publishTime: new Date().toISOString(),
                },
            };
            await util_1.request
                .post('/svc/pubsub/user/prune?token=' + token)
                .send(data)
                .expect(200);
            const deletedUsers = await (0, user_2.findUsersByIds)(toDeleteUserIds);
            (0, chai_1.expect)(deletedUsers.length).to.equal(0);
        });
    });
});
