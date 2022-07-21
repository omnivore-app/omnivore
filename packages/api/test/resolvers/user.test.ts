import { createTestUser, deleteTestUser, getProfile, getUser } from '../db'
import { graphqlRequest, request } from '../util'
import { expect } from 'chai'
import {
  UpdateUserErrorCode,
  UpdateUserProfileErrorCode,
} from '../../src/generated/graphql'
import { User } from '../../src/entity/user'
import { hashPassword } from '../../src/utils/auth'
import 'mocha'

describe('User API', () => {
  const username = 'fake_user'
  const correctPassword = 'fakePassword'
  const anotherUsername = 'newFakeUser'

  let authToken: string
  let user: User
  let anotherUser: User

  before(async () => {
    const hashedPassword = await hashPassword(correctPassword)
    // create test user and login
    user = await createTestUser(username, '', hashedPassword)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    //  create new fake user
    anotherUser = await createTestUser(anotherUsername)
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
    await deleteTestUser(anotherUsername)
  })

  describe('Update user', () => {
    let name = 'Some name'
    let bio = 'Some bio'
    let query: string

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
      `
    })

    context('when name in input is empty', () => {
      before(() => {
        name = ''
      })

      it('responds with error code EMPTY_NAME', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.updateUser.errorCodes).to.eql([
          UpdateUserErrorCode.EmptyName,
        ])
      })
    })

    context('when name is not empty', () => {
      before(() => {
        name = 'Some new name'
      })

      it('updates user and responds with status code 200', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        const user = await getUser(response.body.data.updateUser.user.id)
        expect(user?.name).to.eql(name)
      })
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        mutation {
          updateUser()
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })

  describe('Update user profile', () => {
    let query: string
    let userId = 'Some user id'
    let newUsername = 'Some username'
    let pictureUrl = 'Some picture url'

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
      `
    })

    context('when username is new and valid', () => {
      before(() => {
        userId = user.id
        newUsername = 'new_username'
      })

      it('updates user profile and responds with 200', async () => {
        await graphqlRequest(query, authToken).expect(200)
        const profile = await getProfile(user)
        expect(profile?.username).to.eql(newUsername)
      })
    })

    context('when userId not match', () => {
      before(() => {
        userId = anotherUser.id
      })

      it('responds with error code FORBIDDEN', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.updateUserProfile.errorCodes).to.eql([
          UpdateUserProfileErrorCode.Forbidden,
        ])
      })
    })

    context('when username and pictureUrl are null', () => {
      before(() => {
        userId = user.id
        newUsername = ''
        pictureUrl = ''
      })

      it('responds with error code BadData', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.updateUserProfile.errorCodes).to.eql([
          UpdateUserProfileErrorCode.BadData,
        ])
      })
    })

    context('when username exists', () => {
      before(async () => {
        userId = user.id
        const profile = await getProfile(user)
        newUsername = profile?.username || 'new_username'
      })

      it('responds with error code UsernameExists', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.updateUserProfile.errorCodes).to.eql([
          UpdateUserProfileErrorCode.UsernameExists,
        ])
      })
    })

    context('when username is invalid', () => {
      before(() => {
        userId = user.id
        newUsername = 'omnivore'
      })

      it('responds with error code BadUsername', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.updateUserProfile.errorCodes).to.eql([
          UpdateUserProfileErrorCode.BadUsername,
        ])
      })
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        mutation {
          updateUserProfile()
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })
})
