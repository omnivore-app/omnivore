import 'mocha'
import { expect } from 'chai'
import { User } from '../../src/entity/user'
import { createTestUser, deleteTestUser } from '../db'
import { graphqlRequest, request } from '../util'
import { getRepository } from '../../src/entity/utils'
import { Feature } from '../../src/entity/feature'
import * as jwt from 'jsonwebtoken'
import sinon, { SinonFakeTimers } from 'sinon'
import { env } from '../../src/env'
import { Like } from 'typeorm'

describe('features resolvers', () => {
  let loginUser: User
  let authToken: string

  before(async () => {
    // create test user and login
    loginUser = await createTestUser('loginUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: loginUser.email })

    authToken = res.body.authToken
  })

  after(async () => {
    await deleteTestUser(loginUser.name)
  })

  describe('optInFeature API', () => {
    const featureName = 'ultra-realistic-voice'
    const now = new Date()
    let clock: SinonFakeTimers

    const query = (name: string) => `
      mutation {
        optInFeature(input: {
          name: "${name}"
        }) {
          ... on OptInFeatureSuccess {
            feature {
              name
              grantedAt
              token
            }
          }
          ... on OptInFeatureError {
            errorCodes
          }
        }
      }
    `

    before(() => {
      console.log('opting in to feature')
      // mock date and ignore milliseconds
      clock = sinon.useFakeTimers(now.setSeconds(now.getSeconds(), 0))
    })

    after(() => {
      clock.restore()
    })

    context('when user is the first 1000 users', () => {
      after(async () => {
        // reset feature
        await getRepository(Feature).delete({
          user: { id: loginUser.id },
        })
      })

      it('opts in to the feature', async () => {
        const res = await graphqlRequest(query(featureName), authToken).expect(
          200
        )

        const token = jwt.sign(
          {
            uid: loginUser.id,
            featureName,
            grantedAt: Date.now() / 1000,
          },
          env.server.jwtSecret,
          { expiresIn: '1y' }
        )

        expect(res.body.data.optInFeature).to.eql({
          feature: {
            name: featureName,
            grantedAt: new Date().toISOString(),
            token,
          },
        })
      })
    })

    context('when user is not the first 1000 users', () => {
      before(async () => {
        // create 1000 opt-in users
        const usersToSave = Array.from(Array(1000).keys()).map((i) => {
          return {
            name: `user${i}`,
            source: 'GOOGLE',
            sourceUserId: `fake-user-id-user${i}`,
            email: `user${i}@omnivore.app`,
            username: `user${i}`,
            bio: `i am user${i}`,
          }
        })

        const users = await getRepository(User).save(usersToSave)

        const features = users.map((user) => {
          return {
            user: { id: user.id },
            name: featureName,
            grantedAt: new Date(),
          }
        })

        await getRepository(Feature).save(features)
      })

      after(async () => {
        // reset opt-in users
        await getRepository(User).delete({
          name: Like(`user%`),
        })
        await getRepository(Feature).delete({
          name: featureName,
        })
      })

      it('does not opt in to the feature', async () => {
        const res = await graphqlRequest(query(featureName), authToken).expect(
          200
        )

        const token = jwt.sign(
          {
            uid: loginUser.id,
            featureName,
            grantedAt: null,
          },
          env.server.jwtSecret,
          { expiresIn: '1y' }
        )

        expect(res.body.data.optInFeature).to.eql({
          feature: {
            name: featureName,
            grantedAt: null,
            token,
          },
        })
      })
    })

    context('when user is already opted in', () => {
      before(async () => {
        // opt in
        await getRepository(Feature).save({
          user: { id: loginUser.id },
          name: featureName,
          grantedAt: new Date(),
        })
      })

      after(async () => {
        // reset feature
        await getRepository(Feature).delete({
          user: { id: loginUser.id },
        })
      })

      it('returns the feature', async () => {
        const res = await graphqlRequest(query(featureName), authToken).expect(
          200
        )

        const token = jwt.sign(
          {
            uid: loginUser.id,
            featureName,
            grantedAt: Date.now() / 1000,
          },
          env.server.jwtSecret,
          { expiresIn: '1y' }
        )

        expect(res.body.data.optInFeature).to.eql({
          feature: {
            name: featureName,
            grantedAt: new Date().toISOString(),
            token,
          },
        })
      })
    })
  })
})
