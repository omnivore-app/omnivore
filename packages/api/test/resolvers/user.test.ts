import { expect } from 'chai'
import 'mocha'
import { StatusType, User } from '../../src/entity/user'
import {
  UpdateUserErrorCode,
  UpdateUserProfileErrorCode,
} from '../../src/generated/graphql'
import { userRepository } from '../../src/repository/user'
import { findProfile } from '../../src/services/profile'
import { deleteUser, findActiveUser } from '../../src/services/user'
import { hashPassword } from '../../src/utils/auth'
import { createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

describe('User API', () => {
  const correctPassword = 'fakePassword'
  const anotherUsername = 'newFakeUser'

  let authToken: string
  let user: User
  let anotherUser: User

  before(async () => {
    const hashedPassword = await hashPassword(correctPassword)
    // create test user and login
    user = await createTestUser('fake_user', '', hashedPassword)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    //  create new fake user
    anotherUser = await createTestUser(anotherUsername)
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
    await deleteUser(anotherUser.id)
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
        const user = await findActiveUser(response.body.data.updateUser.user.id)
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
        const profile = await findProfile(user)
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
        const profile = await findProfile(user)
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

  describe('Delete account', () => {
    const query = (userId: string) => `
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
    `

    let userId: string
    let authToken: string

    before(async () => {
      const user = await createTestUser('to_delete_user')
      const res = await request
        .post('/local/debug/fake-user-login')
        .send({ fakeEmail: user.email })
      userId = user.id
      authToken = res.body.authToken
    })

    after(async () => {
      await deleteUser(userId)
    })

    context('when user id is valid', () => {
      it('deletes user and changes email address', async () => {
        const response = await graphqlRequest(query(userId), authToken).expect(
          200
        )
        expect(response.body.data.deleteAccount.userID).to.eql(userId)

        const user = await userRepository.findOneBy({ id: userId })
        expect(user?.status).to.eql(StatusType.Deleted)
        expect(user?.email).to.eql(`deleted_user_${userId}@omnivore.app`)
      })
    })

    context('when user not found', () => {
      it('responds with error code UserNotFound', async () => {
        const response = await graphqlRequest(
          query(generateFakeUuid()),
          authToken
        ).expect(200)
        expect(response.body.data.deleteAccount.errorCodes).to.eql([
          'USER_NOT_FOUND',
        ])
      })
    })
  })
})
