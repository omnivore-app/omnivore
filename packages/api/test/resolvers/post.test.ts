import { expect } from 'chai'
import { User } from '../../src/entity/user'
import { createPosts } from '../../src/services/post'
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

    it('should return an error if the args are invalid', async () => {
      const response = await graphqlRequest(query, '', {
        first: 100,
        userId: loginUser.id,
      })

      expect(response.body.data.posts.errorCodes).to.eql(['BAD_REQUEST'])
    })

    context('when the user is authenticated', () => {
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
        await createPosts(loginUser.id, posts)
      })

      it('should return posts if the user is the owner', async () => {
        const response = await graphqlRequest(query, authToken, {
          first: 10,
          userId: loginUser.id,
        })

        expect(response.body.data.posts.edges).to.be.an('array')
        expect(response.body.data.posts.pageInfo).to.be.an('object')
      })
    })

    it('should return posts if the user is not authenticated and the posts are public', async () => {
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
      await createPosts(loginUser.id, posts)

      const response = await graphqlRequest(query, '', {
        first: 10,
        userId: loginUser.id,
      })

      expect(response.body.data.posts.edges).to.be.an('array')
      expect(response.body.data.posts.pageInfo).to.be.an('object')
    })

    it('should return empty array if the user is not authenticated and the posts are private', async () => {
      const response = await graphqlRequest(query, '', {
        first: 10,
        userId: loginUser.id,
      })

      expect(response.body.data.posts.errorCodes).to.eql(['UNAUTHORIZED'])
    })

    it('should return posts if the user is the owner', async () => {
      const response = await graphqlRequest(query, authToken, {
        first: 10,
        userId: loginUser.id,
      })

      expect(response.body.data.posts.edges).to.be.an('array')
      expect(response.body.data.posts.pageInfo).to.be.an('object')
    })
  })
})
