import {
  createTestDeviceToken,
  createTestUser,
  deleteTestUser,
  getDeviceToken,
} from '../db'
import { generateFakeUuid, graphqlRequest, request } from '../util'
import { expect } from 'chai'
import { UserDeviceToken } from '../../src/entity/user_device_tokens'
import { SetDeviceTokenErrorCode } from '../../src/generated/graphql'
import 'mocha'

describe('Device tokens API', () => {
  const username = 'fakeUser'

  let authToken: string
  let deviceToken: UserDeviceToken

  before(async () => {
    // create test user and login
    const user = await createTestUser(username)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken

    //  create test device token
    deviceToken = await createTestDeviceToken(user)
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
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

    context('when id in input is not null', () => {
      context('when token exists', () => {
        before(() => {
          tokenId = deviceToken.id
          token = ''
        })

        it('responds with status code 200 and deletes the token', async () => {
          const response = await graphqlRequest(query, authToken).expect(200)
          const deviceToken = await getDeviceToken(
            response.body.data.setDeviceToken.deviceToken.id
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
        const deviceToken = await getDeviceToken(
          response.body.data.setDeviceToken.deviceToken.id
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
})
