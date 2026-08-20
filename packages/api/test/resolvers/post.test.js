"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const library_item_1 = require("../../src/services/library_item");
const post_1 = require("../../src/services/post");
const profile_1 = require("../../src/services/profile");
const user_1 = require("../../src/services/user");
const db_1 = require("../db");
const util_1 = require("../util");
describe('Post Resolvers', () => {
    let loginUser;
    let authToken;
    before(async () => {
        // create test user and login
        loginUser = await (0, db_1.createTestUser)('loginUser');
        authToken = await (0, util_1.loginAndGetAuthToken)(loginUser.email);
    });
    after(async () => {
        await (0, user_1.deleteUser)(loginUser.id);
    });
    describe('postsResolver', () => {
        const query = `
      query Posts($first: Int, $after: String, $userId: ID!) {
        posts(first: $first, after: $after, userId: $userId) {
          ... on PostsSuccess {
            edges {
              cursor
              node {
                id
                title
                content
                ownedByViewer
              }
            }
            pageInfo {
              startCursor
              endCursor
              hasPreviousPage
              hasNextPage
            }
          }
          ... on PostsError {
            errorCodes
          }
        }
      }
    `;
        let postIds = [];
        let libraryItem;
        let libraryItem1;
        before(async () => {
            libraryItem = await (0, db_1.createTestLibraryItem)(loginUser.id);
            libraryItem1 = await (0, db_1.createTestLibraryItem)(loginUser.id);
            const posts = [
                {
                    title: 'Post 1',
                    content: 'Content 1',
                    user: loginUser,
                    createdAt: new Date('2021-01-01'),
                    libraryItemIds: [libraryItem.id],
                },
                {
                    title: 'Post 2',
                    content: 'Content 2',
                    user: loginUser,
                    createdAt: new Date('2021-01-02'),
                    libraryItemIds: [libraryItem1.id],
                },
            ];
            const newPosts = await (0, post_1.createPosts)(loginUser.id, posts);
            postIds = newPosts.map((post) => post.id);
        });
        after(async () => {
            await (0, post_1.deletePosts)(loginUser.id, postIds);
            await (0, library_item_1.deleteLibraryItemById)(libraryItem.id, loginUser.id);
            await (0, library_item_1.deleteLibraryItemById)(libraryItem1.id, loginUser.id);
        });
        it('should return an error if the args are invalid', async () => {
            const response = await (0, util_1.graphqlRequest)(query, '', {
                first: 100,
                userId: loginUser.id,
            });
            (0, chai_1.expect)(response.body.data.posts.errorCodes).to.eql(['BAD_REQUEST']);
        });
        context('when the user is authenticated', () => {
            it('should return posts', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken, {
                    first: 10,
                    userId: loginUser.id,
                });
                (0, chai_1.expect)(response.body.data.posts.edges[0].node.id).to.eql(postIds[1]);
                (0, chai_1.expect)(response.body.data.posts.edges[1].node.id).to.eql(postIds[0]);
                (0, chai_1.expect)(response.body.data.posts.edges[0].node.ownedByViewer).to.be.true;
            });
        });
        context('when the user is not authenticated', () => {
            context('when user profile is public', () => {
                before(async () => {
                    await (0, profile_1.updateProfile)(loginUser.id, { private: false });
                });
                after(async () => {
                    await (0, profile_1.updateProfile)(loginUser.id, { private: true });
                });
                it('should return posts', async () => {
                    const response = await (0, util_1.graphqlRequest)(query, '', {
                        first: 10,
                        userId: loginUser.id,
                    });
                    (0, chai_1.expect)(response.body.data.posts.edges[0].node.id).to.eql(postIds[1]);
                    (0, chai_1.expect)(response.body.data.posts.edges[1].node.id).to.eql(postIds[0]);
                    (0, chai_1.expect)(response.body.data.posts.edges[0].node.ownedByViewer).to.be
                        .false;
                });
            });
            context('when user profile is private', () => {
                before(async () => {
                    await (0, profile_1.updateProfile)(loginUser.id, { private: true });
                });
                after(async () => {
                    await (0, profile_1.updateProfile)(loginUser.id, { private: false });
                });
                it('should return empty array', async () => {
                    const response = await (0, util_1.graphqlRequest)(query, '', {
                        first: 10,
                        userId: loginUser.id,
                    });
                    (0, chai_1.expect)(response.body.data.posts.edges).to.be.empty;
                });
            });
        });
    });
    describe('postResolver', () => {
        const query = `
      query Post($id: ID!) {
        post(id: $id) {
          ... on PostSuccess {
            post {
              id
              title
              content
              ownedByViewer
            }
          }
          ... on PostError {
            errorCodes
          }
        }
      }
    `;
        let postId;
        let libraryItem;
        before(async () => {
            libraryItem = await (0, db_1.createTestLibraryItem)(loginUser.id);
            const post = {
                title: 'Post',
                content: 'Content',
                user: loginUser,
                libraryItemIds: [libraryItem.id],
            };
            const newPost = await (0, post_1.createPosts)(loginUser.id, [post]);
            postId = newPost[0].id;
        });
        after(async () => {
            await (0, post_1.deletePosts)(loginUser.id, [postId]);
            await (0, library_item_1.deleteLibraryItemById)(libraryItem.id, loginUser.id);
        });
        it('should return an error if the args are invalid', async () => {
            const response = await (0, util_1.graphqlRequest)(query, '', {
                id: '',
            });
            (0, chai_1.expect)(response.body.data.post.errorCodes).to.eql(['BAD_REQUEST']);
        });
        it('should return an error if the post is not found', async () => {
            const response = await (0, util_1.graphqlRequest)(query, '', {
                id: (0, util_1.generateFakeUuid)(),
            });
            (0, chai_1.expect)(response.body.data.post.errorCodes).to.eql(['NOT_FOUND']);
        });
        context('when the user is authenticated', () => {
            it('should return the post', async () => {
                const response = await (0, util_1.graphqlRequest)(query, authToken, {
                    id: postId,
                });
                (0, chai_1.expect)(response.body.data.post.post.id).to.eql(postId);
                (0, chai_1.expect)(response.body.data.post.post.ownedByViewer).to.be.true;
            });
        });
        context('when the user is not authenticated', () => {
            context('when user profile is public', () => {
                before(async () => {
                    await (0, profile_1.updateProfile)(loginUser.id, { private: false });
                });
                after(async () => {
                    await (0, profile_1.updateProfile)(loginUser.id, { private: true });
                });
                it('should return the post', async () => {
                    const response = await (0, util_1.graphqlRequest)(query, '', {
                        id: postId,
                    });
                    (0, chai_1.expect)(response.body.data.post.post.id).to.eql(postId);
                    (0, chai_1.expect)(response.body.data.post.post.ownedByViewer).to.be.false;
                });
            });
            context('when user profile is private', () => {
                before(async () => {
                    await (0, profile_1.updateProfile)(loginUser.id, { private: true });
                });
                after(async () => {
                    await (0, profile_1.updateProfile)(loginUser.id, { private: false });
                });
                it('should return an error', async () => {
                    const response = await (0, util_1.graphqlRequest)(query, '', {
                        id: postId,
                    });
                    (0, chai_1.expect)(response.body.data.post.errorCodes).to.eql(['NOT_FOUND']);
                });
            });
        });
    });
    describe('createPostResolver', () => {
        const mutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on CreatePostSuccess {
            post {
              id
              title
              content
            }
          }
          ... on CreatePostError {
            errorCodes
          }
        }
      }
    `;
        it('should create a post', async () => {
            const libraryItem = await (0, db_1.createTestLibraryItem)(loginUser.id);
            const response = await (0, util_1.graphqlRequest)(mutation, authToken, {
                input: {
                    title: 'Post',
                    content: 'Content',
                    libraryItemIds: [libraryItem.id],
                },
            });
            (0, chai_1.expect)(response.body.data.createPost.post.title).to.eql('Post');
            (0, chai_1.expect)(response.body.data.createPost.post.content).to.eql('Content');
            const postId = response.body.data.createPost.post.id;
            const post = await (0, post_1.findPublicPostById)(postId);
            (0, chai_1.expect)(post).to.exist;
            (0, chai_1.expect)(post?.title).to.eql('Post');
            const profile = await (0, profile_1.findProfile)(loginUser);
            (0, chai_1.expect)(profile?.private).to.be.false;
            await (0, post_1.deletePosts)(loginUser.id, [postId]);
            await (0, library_item_1.deleteLibraryItemById)(libraryItem.id, loginUser.id);
        });
    });
    describe('updatePostResolver', () => {
        const mutation = `
      mutation UpdatePost($input: UpdatePostInput!) {
        updatePost(input: $input) {
          ... on UpdatePostSuccess {
            post {
              id
              title
              content
            }
          }
          ... on UpdatePostError {
            errorCodes
          }
        }
      }
    `;
        let postId;
        let libraryItem;
        before(async () => {
            libraryItem = await (0, db_1.createTestLibraryItem)(loginUser.id);
            const post = {
                title: 'Post',
                content: 'Content',
                user: loginUser,
                libraryItemIds: [libraryItem.id],
            };
            const newPost = await (0, post_1.createPosts)(loginUser.id, [post]);
            postId = newPost[0].id;
        });
        after(async () => {
            await (0, post_1.deletePosts)(loginUser.id, [postId]);
            await (0, library_item_1.deleteLibraryItemById)(libraryItem.id, loginUser.id);
        });
        it('should return an error if the args are invalid', async () => {
            const response = await (0, util_1.graphqlRequest)(mutation, authToken, {
                input: {
                    id: postId,
                    title: null,
                    content: null,
                },
            });
            (0, chai_1.expect)(response.body.data.updatePost.errorCodes).to.eql(['BAD_REQUEST']);
        });
        it('should return an error if the post is not found', async () => {
            const response = await (0, util_1.graphqlRequest)(mutation, authToken, {
                input: {
                    id: (0, util_1.generateFakeUuid)(),
                    title: 'Post',
                    content: 'Content',
                },
            });
            (0, chai_1.expect)(response.body.data.updatePost.errorCodes).to.eql(['UNAUTHORIZED']);
        });
        it('should return an error if the user is not the owner of the post', async () => {
            const notOwner = await (0, db_1.createTestUser)('notOwner');
            const notOwnerToken = await (0, util_1.loginAndGetAuthToken)(notOwner.email);
            const response = await (0, util_1.graphqlRequest)(mutation, notOwnerToken, {
                input: {
                    id: postId,
                    title: 'Post',
                    content: 'Content',
                },
            });
            (0, chai_1.expect)(response.body.data.updatePost.errorCodes).to.eql(['UNAUTHORIZED']);
            await (0, user_1.deleteUser)(notOwner.id);
        });
        it('should update the post', async () => {
            const response = await (0, util_1.graphqlRequest)(mutation, authToken, {
                input: {
                    id: postId,
                    title: 'Updated Post',
                    content: 'Updated Content',
                },
            });
            (0, chai_1.expect)(response.body.data.updatePost.post.title).to.eql('Updated Post');
            (0, chai_1.expect)(response.body.data.updatePost.post.content).to.eql('Updated Content');
            const post = await (0, post_1.findPublicPostById)(postId);
            (0, chai_1.expect)(post?.title).to.eql('Updated Post');
        });
    });
    describe('deletePostResolver', () => {
        const mutation = `
      mutation DeletePost($id: ID!) {
        deletePost(id: $id) {
          ... on DeletePostSuccess {
            success
          }
          ... on DeletePostError {
            errorCodes
          }
        }
      }
    `;
        let postId;
        let libraryItem;
        before(async () => {
            libraryItem = await (0, db_1.createTestLibraryItem)(loginUser.id);
            const post = {
                title: 'Post',
                content: 'Content',
                user: loginUser,
                libraryItemIds: [libraryItem.id],
            };
            const newPost = await (0, post_1.createPosts)(loginUser.id, [post]);
            postId = newPost[0].id;
        });
        after(async () => {
            await (0, post_1.deletePosts)(loginUser.id, [postId]);
            await (0, library_item_1.deleteLibraryItemById)(libraryItem.id, loginUser.id);
        });
        it('should return an error if the args are invalid', async () => {
            const response = await (0, util_1.graphqlRequest)(mutation, authToken, {
                id: '',
            });
            (0, chai_1.expect)(response.body.data.deletePost.errorCodes).to.eql(['BAD_REQUEST']);
        });
        it('should return an error if the post is not found', async () => {
            const response = await (0, util_1.graphqlRequest)(mutation, authToken, {
                id: (0, util_1.generateFakeUuid)(),
            });
            (0, chai_1.expect)(response.body.data.deletePost.errorCodes).to.eql(['UNAUTHORIZED']);
        });
        it('should return an error if the user is not the owner of the post', async () => {
            const notOwner = await (0, db_1.createTestUser)('notOwner');
            const notOwnerToken = await (0, util_1.loginAndGetAuthToken)(notOwner.email);
            const response = await (0, util_1.graphqlRequest)(mutation, notOwnerToken, {
                id: postId,
            });
            (0, chai_1.expect)(response.body.data.deletePost.errorCodes).to.eql(['UNAUTHORIZED']);
            const post = await (0, post_1.findPublicPostById)(postId);
            (0, chai_1.expect)(post).to.exist;
            await (0, user_1.deleteUser)(notOwner.id);
        });
        it('should delete the post', async () => {
            const response = await (0, util_1.graphqlRequest)(mutation, authToken, {
                id: postId,
            });
            (0, chai_1.expect)(response.body.data.deletePost.success).to.be.true;
            const post = await (0, post_1.findPublicPostById)(postId);
            (0, chai_1.expect)(post).to.not.exist;
        });
    });
});
