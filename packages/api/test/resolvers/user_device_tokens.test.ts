import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { UserDeviceToken } from '../../src/entity/user_device_tokens'
import { SetDeviceTokenErrorCode } from '../../src/generated/graphql'
import { deleteUser } from '../../src/services/user'
import {
  createDeviceToken,
  deleteDeviceTokens,
  findDeviceTokenById,
} from '../../src/services/user_device_tokens'
import { createTestDeviceToken, createTestUser } from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'

describe('Device tokens API', () => {
  let authToken: string
  let deviceToken: UserDeviceToken
  let user: User

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    //  create test device token
    deviceToken = await createTestDeviceToken(user)
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('Set device token', () => {
    let token = 'Some token'
    let tokenId = 'Some device token id'
    let query: string

    beforeEach(() => {
      query = `
        mutation {
          setDeviceToken(
            input: {
              id: "${tokenId}"
              token: "${token}"
            }
          ) {
            ... on SetDeviceTokenSuccess {
              deviceToken {
                id
                token
                createdAt
              }
            }
            ... on SetDeviceTokenError {
              errorCodes
            }
          }
        }
      `
    })

    after(async () => {
      // clean up
      await deleteDeviceTokens(user.id, { user: { id: user.id } })
    })

    context('when id in input is not null', () => {
      context('when token exists', () => {
        before(() => {
          tokenId = deviceToken.id
          token = ''
        })

        it('responds with status code 200 and deletes the token', async () => {
          const response = await graphqlRequest(query, authToken).expect(200)
          const deviceToken = await findDeviceTokenById(
            response.body.data.setDeviceToken.deviceToken.id,
            user.id
          )
          expect(deviceToken).to.be.null
        })
      })

      context('when token not exists', () => {
        before(() => {
          tokenId = generateFakeUuid()
          token = ''
        })

        it('responds with error code NOT_FOUND', async () => {
          const response = await graphqlRequest(query, authToken).expect(200)
          expect(response.body.data.setDeviceToken.errorCodes).to.eql([
            SetDeviceTokenErrorCode.NotFound,
          ])
        })
      })
    })

    context('when id in input is null and token is not null', () => {
      before(() => {
        tokenId = ''
        token = 'Some new token'
      })

      it('responds with status code 200 and creates the token', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        const deviceToken = await findDeviceTokenById(
          response.body.data.setDeviceToken.deviceToken.id,
          user.id
        )
        expect(deviceToken).not.to.be.null
      })
    })

    context('when both id and token in input are null', () => {
      before(() => {
        tokenId = ''
        token = ''
      })

      it('responds with error code BAD_REQUEST', async () => {
        const response = await graphqlRequest(query, authToken).expect(200)
        expect(response.body.data.setDeviceToken.errorCodes).to.eql([
          SetDeviceTokenErrorCode.BadRequest,
        ])
      })
    })

    it('responds status code 400 when invalid query', async () => {
      const invalidQuery = `
        mutation {
          setDeviceToken()
        }
      `
      return graphqlRequest(invalidQuery, authToken).expect(400)
    })

    it('responds status code 500 when invalid user', async () => {
      const invalidAuthToken = 'Fake token'
      return graphqlRequest(query, invalidAuthToken).expect(500)
    })
  })

  describe('Get device tokens', () => {
    const token = 'Some token'

    const query = `
      query {
        deviceTokens {
          ... on DeviceTokensSuccess {
            deviceTokens {
              id
              token
              createdAt
            }
          }
          ... on DeviceTokensError {
            errorCodes
          }
        }
      }
    `

    before(async () => {
      // create test device token
      await createDeviceToken(user.id, token)
    })

    after(async () => {
      // clean up
      await deleteDeviceTokens(user.id, { token })
    })

    it('responds with status code 200 and returns all device tokens', async () => {
      const response = await graphqlRequest(query, authToken).expect(200)
      expect(response.body.data.deviceTokens.deviceTokens).to.have.lengthOf(1)
    })
  })
})
