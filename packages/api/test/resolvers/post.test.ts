import { expect } from 'chai'
import { User } from '../../src/entity/user'
import { updateUserProfileResolver } from '../../src/resolvers'
import { createPosts, deletePosts } from '../../src/services/post'
import { deleteUser } from '../../src/services/user'
import { createTestUser } from '../db'
import { graphqlRequest, loginAndGetAuthToken } from '../util'

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
        },
        {
          title: 'Post 2',
          content: 'Content 2',
          user: loginUser,
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
      context('when the posts are public', () => {
        before(async () => {
          await updateUserProfileResolver
        it('should return posts', async () => {
          const response = await graphqlRequest(query, '', {
            first: 10,
            userId: loginUser.id,
          })

          expect(response.body.data.posts.edges[0].node.id).to.eql(postIds[1])
          expect(response.body.data.posts.edges[1].node.id).to.eql(postIds[0])
          expect(response.body.data.posts.edges[0].node.ownedByViewer).to.be
            .true
        })
      })

      context('when the posts are private', () => {
        it('should return empty array', async () => {
          const response = await graphqlRequest(query, '', {
            first: 10,
            userId: loginUser.id,
          })

          expect(response.body.data.posts.errorCodes).to.eql(['UNAUTHORIZED'])
        })
      })
    })
  })
})
