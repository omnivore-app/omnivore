"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const filter_1 = require("../../src/entity/filter");
const user_1 = require("../../src/entity/user");
const repository_1 = require("../../src/repository");
const profile_1 = require("../../src/services/profile");
const user_2 = require("../../src/services/user");
const db_1 = require("../db");
describe('create user', () => {
    context('creates a user through manual sign up', () => {
        it('adds the default filters to the user', async () => {
            after(async () => {
                const testUser = await (0, repository_1.getRepository)(user_1.User).findOneBy({
                    name: 'filter_user',
                });
                await (0, user_2.deleteUser)(testUser.id);
                await (0, db_1.deleteFiltersFromUser)(testUser.id);
            });
            const user = await (0, db_1.createTestUser)('filter_user');
            const filters = await (0, repository_1.authTrx)((t) => t.getRepository(filter_1.Filter).findBy({ user: { id: user.id } }), {
                uid: user.id,
            });
            (0, chai_1.expect)(filters).not.to.be.empty;
        });
    });
    context('create a user with an invite', () => {
        // it('follows the other user in the group', async () => {
        //   after(async () => {
        //     const testUser = await getRepository(User).findOneBy({
        //       name: 'testuser',
        //     })
        //     await deleteTestUser(testUser!.id)
        //     const testOwner = await getRepository(User).findOneBy({
        //       name: 'testowner',
        //     })
        //     await deleteTestUser(testOwner!.id)
        //   })
        //   const testOwner = 'testowner'
        //   const testUser = 'testuser'
        //   const adminUser = await createTestUser(testOwner)
        //   const admninIds = [adminUser.id]
        //   const [, invite] = await createGroup({
        //     admin: adminUser,
        //     name: 'testgroup',
        //   })
        //   const user = await createTestUser(testUser, invite.code)
        //   const userIds = [user.id]
        //   const userFollowers = await getUserFollowers(user)
        //   const userFollowing = await getUserFollowing(user)
        //   const adminUserFollowers = await getUserFollowers(adminUser)
        //   const adminUserFollowing = await getUserFollowing(adminUser)
        //   expect(userFollowers.map((u) => u.id)).to.eql(admninIds)
        //   expect(userFollowing.map((u) => u.id)).to.eql(admninIds)
        //   expect(adminUserFollowers.map((u) => u.id)).to.eql(userIds)
        //   expect(adminUserFollowing.map((u) => u.id)).to.eql(userIds)
        // })
        it('creates profile when user exists but profile not', async () => {
            after(async () => {
                const user = await (0, repository_1.getRepository)(user_1.User).findOneBy({
                    name: 'userWithoutProfile',
                });
                await (0, user_2.deleteUser)(user.id);
            });
            const name = 'userWithoutProfile';
            const user = await (0, db_1.createUserWithoutProfile)(name);
            await (0, db_1.createTestUser)(user.name);
            const profile = await (0, profile_1.findProfile)(user);
            (0, chai_1.expect)(profile).to.exist;
        });
    });
    context('create a user with pending confirmation', () => {
        const name = 'pendingUser';
        context('when email sends successfully', () => {
            afterEach(async () => {
                const user = await (0, repository_1.getRepository)(user_1.User).findOneBy({ name });
                await (0, user_2.deleteUser)(user.id);
            });
            it('creates the user with pending status and correct name', async () => {
                const user = await (0, db_1.createTestUser)(name, undefined, undefined, true);
                (0, chai_1.expect)(user.status).to.eql(user_1.StatusType.Pending);
                (0, chai_1.expect)(user.name).to.eql(name);
            });
        });
    });
});
