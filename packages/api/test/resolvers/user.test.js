"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const user_1 = require("../../src/entity/user");
const graphql_1 = require("../../src/generated/graphql");
const user_2 = require("../../src/repository/user");
const profile_1 = require("../../src/services/profile");
const user_3 = require("../../src/services/user");
const auth_1 = require("../../src/utils/auth");
const db_1 = require("../db");
const util_1 = require("../util");
describe('User API', () => {
    const correctPassword = 'fakePassword';
    const anotherUsername = 'newFakeUser';
    let authToken;
    let user;
    let anotherUser;
    before(async () => {
        const hashedPassword = await (0, auth_1.hashPassword)(correctPassword);
        // create test user and login
        user = await (0, db_1.createTestUser)('fake_user', '', hashedPassword);
        const res = await util_1.request
            .post('/local/debug/fake-user-login')
            .send({ fakeEmail: user.email });
        authToken = res.body.authToken;
        //  create new fake user
        anotherUser = await (0, db_1.createTestUser)(anotherUsername);
    });
    after(async () => {
        // clean up
        await (0, user_3.deleteUser)(user.id);
        await (0, user_3.deleteUser)(anotherUser.id);
    });
    describe('Update user', () => {
        let name = 'Some name';
        let bio = 'Some bio';
        let query;
        beforeEach(() => {
            query = `
        mutation {
          updateUser(
            input: {
              name: "${name}"
              bio: "${bio}"
            }
          ) {
            ... on UpdateUserSuccess {
              user {
                id
                name
                isFullUser
                viewerIsFollowing
                isFriend
                picture
                profile {
                  id
                  username
                  private
                  bio
                  pictureUrl
                }
              }
            }
            ... on UpdateUserError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when name in input is empty', () => {
            before(() => {
                name = '';
            });
            it('responds with error code EMPTY_NAME', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.updateUser.errorCodes).to.eql([
                    graphql_1.UpdateUserErrorCode.EmptyName,
                ]);
            });
        });
        context('when name is not empty', () => {
            before(() => {
                name = 'Some new name';
            });
            it('updates user and responds with status code 200', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const user = await (0, user_3.findActiveUser)(response.body.data.updateUser.user.id);
                (0, chai_1.expect)(user?.name).to.eql(name);
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        mutation {
          updateUser()
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Update user profile', () => {
        let query;
        let userId = 'Some user id';
        let newUsername = 'Some username';
        let pictureUrl = 'Some picture url';
        beforeEach(() => {
            query = `
        mutation {
          updateUserProfile(
            input: {
              userId: "${userId}"
              username: "${newUsername}"
              pictureUrl: "${pictureUrl}"
            }
          ) {
            ... on UpdateUserProfileSuccess {
              user {
                id
                profile {
                  id
                  username
                  private
                  bio
                  pictureUrl
                }
              }
            }
            ... on UpdateUserProfileError {
              errorCodes
            }
          }
        }
      `;
        });
        context('when username is new and valid', () => {
            before(() => {
                userId = user.id;
                newUsername = 'new_username';
            });
            it('updates user profile and responds with 200', async () => {
                await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                const profile = await (0, profile_1.findProfile)(user);
                (0, chai_1.expect)(profile?.username).to.eql(newUsername);
            });
        });
        context('when userId not match', () => {
            before(() => {
                userId = anotherUser.id;
            });
            it('responds with error code FORBIDDEN', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.updateUserProfile.errorCodes).to.eql([
                    graphql_1.UpdateUserProfileErrorCode.Forbidden,
                ]);
            });
        });
        context('when username and pictureUrl are null', () => {
            before(() => {
                userId = user.id;
                newUsername = '';
                pictureUrl = '';
            });
            it('responds with error code BadData', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.updateUserProfile.errorCodes).to.eql([
                    graphql_1.UpdateUserProfileErrorCode.BadData,
                ]);
            });
        });
        context('when username exists', () => {
            before(async () => {
                userId = user.id;
                const profile = await (0, profile_1.findProfile)(user);
                newUsername = profile?.username || 'new_username';
            });
            it('responds with error code UsernameExists', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.updateUserProfile.errorCodes).to.eql([
                    graphql_1.UpdateUserProfileErrorCode.UsernameExists,
                ]);
            });
        });
        context('when username is invalid', () => {
            before(() => {
                userId = user.id;
                newUsername = 'omnivore';
            });
            it('responds with error code BadUsername', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken).expect(200);
                (0, chai_1.expect)(response.body.data.updateUserProfile.errorCodes).to.eql([
                    graphql_1.UpdateUserProfileErrorCode.BadUsername,
                ]);
            });
        });
        it('responds status code 400 when invalid query', async () => {
            const invalidQuery = `
        mutation {
          updateUserProfile()
        }
      `;
            return (0, util_1.graphqlRequest)(invalidQuery, authToken).expect(400);
        });
        it('responds status code 500 when invalid user', async () => {
            const invalidAuthToken = 'Fake token';
            return (0, util_1.graphqlRequest)(query, invalidAuthToken).expect(500);
        });
    });
    describe('Delete account', () => {
        const query = (userId) => `
      mutation {
        deleteAccount(
          userID: "${userId}"
        ) {
          ... on DeleteAccountSuccess {
            userID
          }
          ... on DeleteAccountError {
            errorCodes
          }
        }
      }
    `;
        let userId;
        let authToken;
        before(async () => {
            const user = await (0, db_1.createTestUser)('to_delete_user');
            const res = await util_1.request
                .post('/local/debug/fake-user-login')
                .send({ fakeEmail: user.email });
            userId = user.id;
            authToken = res.body.authToken;
        });
        after(async () => {
            await (0, user_3.deleteUser)(userId);
        });
        context('when user id is valid', () => {
            it('deletes user and changes email address', async () => {
                const response = await (0, util_1.graphqlRequest)(query(userId), authToken).expect(200);
                (0, chai_1.expect)(response.body.data.deleteAccount.userID).to.eql(userId);
                const user = await user_2.userRepository.findOneBy({ id: userId });
                (0, chai_1.expect)(user?.status).to.eql(user_1.StatusType.Deleted);
                (0, chai_1.expect)(user?.email).to.eql(`deleted_user_${userId}@omnivore.work`);
            });
        });
        context('when user not found', () => {
            it('responds with error code UserNotFound', async () => {
                const response = await (0, util_1.graphqlRequest)(query((0, util_1.generateFakeUuid)()), authToken).expect(200);
                (0, chai_1.expect)(response.body.data.deleteAccount.errorCodes).to.eql([
                    'USER_NOT_FOUND',
                ]);
            });
        });
    });
});
