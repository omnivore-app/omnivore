import { expect } from 'chai'
import 'mocha'
import { User } from '../../src/entity/user'
import { UserPersonalization } from '../../src/entity/user_personalization'
import { deleteUser } from '../../src/services/user'
import {
  deleteUserPersonalization,
  findUserPersonalization,
  saveUserPersonalization,
} from '../../src/services/user_personalization'
import { createTestUser } from '../db'
import { graphqlRequest, request } from '../util'

describe('User Personalization API', () => {
  let authToken: string
  let user: User

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('Set user personalization', () => {
    const query = `
      mutation SetUserPersonalization($input: SetUserPersonalizationInput!) {
        setUserPersonalization(input: $input) {
          ... on SetUserPersonalizationSuccess {
            updatedUserPersonalization {
              id
              fields
            }
          }
          ... on SetUserPersonalizationError {
            errorCodes
          }
        }
      }
    `

    context('when user personalization does not exist', () => {
      it('creates a new user personalization', async () => {
        const fields = {
          testField: 'testValue',
        }

        const res = await graphqlRequest(query, authToken, {
          input: { fields },
        }).expect(200)

        expect(
          res.body.data.setUserPersonalization.updatedUserPersonalization.fields
        ).to.eql(fields)

        const userPersonalization = await findUserPersonalization(
          res.body.data.setUserPersonalization.updatedUserPersonalization.id,
          user.id
        )
        expect(userPersonalization).to.not.be.null

        // clean up
        await deleteUserPersonalization(
          res.body.data.setUserPersonalization.updatedUserPersonalization.id,
          user.id
        )
      })
    })

    context('when user personalization exists', () => {
      let existingUserPersonalization: UserPersonalization

      before(async () => {
        existingUserPersonalization = await saveUserPersonalization(user.id, {
          user: { id: user.id },
          fields: {
            testField: 'testValue',
          },
        })
      })

      after(async () => {
        // clean up
        await deleteUserPersonalization(existingUserPersonalization.id, user.id)
      })

      it('updates the user personalization', async () => {
        const newFields = {
          testField: 'testValue1',
        }

        const res = await graphqlRequest(query, authToken, {
          input: { fields: newFields },
        }).expect(200)

        expect(
          res.body.data.setUserPersonalization.updatedUserPersonalization.fields
        ).to.eql(newFields)

        const updatedUserPersonalization = await findUserPersonalization(
          existingUserPersonalization.id,
          user.id
        )
        expect(updatedUserPersonalization?.fields).to.eql(newFields)
      })
    })
  })

  describe('Get user personalization', () => {
    let existingUserPersonalization: UserPersonalization

    before(async () => {
      existingUserPersonalization = await saveUserPersonalization(user.id, {
        user: { id: user.id },
        fields: {
          testField: 'testValue',
        },
      })
    })

    after(async () => {
      // clean up
      await deleteUserPersonalization(existingUserPersonalization.id, user.id)
    })

    const query = `
      query GetUserPersonalization {
        getUserPersonalization {
          ... on GetUserPersonalizationSuccess {
            userPersonalization {
              id
              fields
            }
          }
          ... on GetUserPersonalizationError {
            errorCodes
          }
        }
      }
    `

    it('returns the user personalization', async () => {
      const res = await graphqlRequest(query, authToken).expect(200)

      expect(res.body.data.getUserPersonalization.userPersonalization).to.eql({
        id: existingUserPersonalization.id,
        fields: existingUserPersonalization.fields,
      })
    })
  })
})
