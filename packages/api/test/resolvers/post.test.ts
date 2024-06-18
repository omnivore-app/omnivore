import { expect } from 'chai'
import { User } from '../../src/entity/user'
import {
  createPosts,
  deletePosts,
  findPublicPostById,
} from '../../src/services/post'
import { findProfile, updateProfile } from '../../src/services/profile'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, loginAndGetAuthToken } from '../util'

describe('Post Resolvers', () => {
  let loginUser: User
  let authToken: string

  before(async () => {
    // create test user and login
    loginUser = await createTestUser('loginUser')
    authToken = await loginAndGetAuthToken(loginUser.email)
  })

  after(async () => {
    await deleteUser(loginUser.id)
  })

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
    `

    let postIds: Array<string> = []

    before(async () => {
      const posts = [
        {
          title: 'Post 1',
          content: 'Content 1',
          user: loginUser,
          createdAt: new Date('2021-01-01'),
        },
        {
          title: 'Post 2',
          content: 'Content 2',
          user: loginUser,
          createdAt: new Date('2021-01-02'),
        },
      ]
      const newPosts = await createPosts(loginUser.id, posts)

      postIds = newPosts.map((post) => post.id)
    })

    after(async () => {
      await deletePosts(loginUser.id, postIds)
    })

    it('should return an error if the args are invalid', async () => {
      const response = await graphqlRequest(query, '', {
        first: 100,
        userId: loginUser.id,
      })

      expect(response.body.data.posts.errorCodes).to.eql(['BAD_REQUEST'])
    })

    context('when the user is authenticated', () => {
      it('should return posts', async () => {
        const response = await graphqlRequest(query, authToken, {
          first: 10,
          userId: loginUser.id,
        })

        expect(response.body.data.posts.edges[0].node.id).to.eql(postIds[1])
        expect(response.body.data.posts.edges[1].node.id).to.eql(postIds[0])
        expect(response.body.data.posts.edges[0].node.ownedByViewer).to.be.true
      })
    })

    context('when the user is not authenticated', () => {
      context('when user profile is public', () => {
        before(async () => {
          await updateProfile(loginUser.id, { private: false })
        })

        after(async () => {
          await updateProfile(loginUser.id, { private: true })
        })

        it('should return posts', async () => {
          const response = await graphqlRequest(query, '', {
            first: 10,
            userId: loginUser.id,
          })

          expect(response.body.data.posts.edges[0].node.id).to.eql(postIds[1])
          expect(response.body.data.posts.edges[1].node.id).to.eql(postIds[0])
          expect(response.body.data.posts.edges[0].node.ownedByViewer).to.be
            .false
        })
      })

      context('when user profile is private', () => {
        before(async () => {
          await updateProfile(loginUser.id, { private: true })
        })

        after(async () => {
          await updateProfile(loginUser.id, { private: false })
        })

        it('should return empty array', async () => {
          const response = await graphqlRequest(query, '', {
            first: 10,
            userId: loginUser.id,
          })

          expect(response.body.data.posts.edges).to.be.empty
        })
      })
    })
  })

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
    `

    let postId: string

    before(async () => {
      const post = {
        title: 'Post',
        content: 'Content',
        user: loginUser,
      }
      const newPost = await createPosts(loginUser.id, [post])

      postId = newPost[0].id
    })

    after(async () => {
      await deletePosts(loginUser.id, [postId])
    })

    it('should return an error if the args are invalid', async () => {
      const response = await graphqlRequest(query, '', {
        id: '',
      })

      expect(response.body.data.post.errorCodes).to.eql(['BAD_REQUEST'])
    })

    it('should return an error if the post is not found', async () => {
      const response = await graphqlRequest(query, '', {
        id: generateFakeUuid(),
      })

      expect(response.body.data.post.errorCodes).to.eql(['NOT_FOUND'])
    })

    context('when the user is authenticated', () => {
      it('should return the post', async () => {
        const response = await graphqlRequest(query, authToken, {
          id: postId,
        })

        expect(response.body.data.post.post.id).to.eql(postId)
        expect(response.body.data.post.post.ownedByViewer).to.be.true
      })
    })

    context('when the user is not authenticated', () => {
      context('when user profile is public', () => {
        before(async () => {
          await updateProfile(loginUser.id, { private: false })
        })

        after(async () => {
          await updateProfile(loginUser.id, { private: true })
        })

        it('should return the post', async () => {
          const response = await graphqlRequest(query, '', {
            id: postId,
          })

          expect(response.body.data.post.post.id).to.eql(postId)
          expect(response.body.data.post.post.ownedByViewer).to.be.false
        })
      })

      context('when user profile is private', () => {
        before(async () => {
          await updateProfile(loginUser.id, { private: true })
        })

        after(async () => {
          await updateProfile(loginUser.id, { private: false })
        })

        it('should return an error', async () => {
          const response = await graphqlRequest(query, '', {
            id: postId,
          })

          expect(response.body.data.post.errorCodes).to.eql(['NOT_FOUND'])
        })
      })
    })
  })

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
    `

    it('should create a post', async () => {
      const response = await graphqlRequest(mutation, authToken, {
        input: {
          title: 'Post',
          content: 'Content',
        },
      })

      expect(response.body.data.createPost.post.title).to.eql('Post')
      expect(response.body.data.createPost.post.content).to.eql('Content')

      const postId = response.body.data.createPost.post.id as string

      const post = await findPublicPostById(postId)
      expect(post).to.exist
      expect(post?.title).to.eql('Post')

      const profile = await findProfile(loginUser)
      expect(profile?.private).to.be.false

      await deletePosts(loginUser.id, [postId])
    })
  })

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
    `

    let postId: string

    before(async () => {
      const post = {
        title: 'Post',
        content: 'Content',
        user: loginUser,
      }
      const newPost = await createPosts(loginUser.id, [post])

      postId = newPost[0].id
    })

    after(async () => {
      await deletePosts(loginUser.id, [postId])
    })

    it('should return an error if the args are invalid', async () => {
      const response = await graphqlRequest(mutation, authToken, {
        input: {
          id: postId,
          title: null,
          content: null,
        },
      })

      expect(response.body.data.updatePost.errorCodes).to.eql(['BAD_REQUEST'])
    })

    it('should return an error if the post is not found', async () => {
      const response = await graphqlRequest(mutation, authToken, {
        input: {
          id: generateFakeUuid(),
          title: 'Post',
          content: 'Content',
        },
      })

      expect(response.body.data.updatePost.errorCodes).to.eql(['UNAUTHORIZED'])
    })

    it('should return an error if the user is not the owner of the post', async () => {
      const notOwner = await createTestUser('notOwner')
      const notOwnerToken = await loginAndGetAuthToken(notOwner.email)

      const response = await graphqlRequest(mutation, notOwnerToken, {
        input: {
          id: postId,
          title: 'Post',
          content: 'Content',
        },
      })

      expect(response.body.data.updatePost.errorCodes).to.eql(['UNAUTHORIZED'])

      await deleteUser(notOwner.id)
    })

    it('should update the post', async () => {
      const response = await graphqlRequest(mutation, authToken, {
        input: {
          id: postId,
          title: 'Updated Post',
          content: 'Updated Content',
        },
      })

      expect(response.body.data.updatePost.post.title).to.eql('Updated Post')
      expect(response.body.data.updatePost.post.content).to.eql(
        'Updated Content'
      )

      const post = await findPublicPostById(postId)
      expect(post?.title).to.eql('Updated Post')
    })
  })
})
