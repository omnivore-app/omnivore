import { expect } from 'chai'
import 'mocha'
import nock from 'nock'
import sinon from 'sinon'
import { User } from '../../src/entity/user'
import { env } from '../../src/env'
import { deleteUser } from '../../src/services/user'
import * as createTask from '../../src/utils/createTask'
import { createTestUser } from '../db'
import { request } from '../util'

describe('/article/save API', () => {
  let user: User
  let authToken: string

  // We need to mock the pupeeteer-parse
  // service here because in dev mode the task gets
  // called immediately.
  if (env.queue.contentFetchUrl) {
    nock(env.queue.contentFetchUrl).post('/').reply(200)
  }

  before(async () => {
    // create test user and login
    user = await createTestUser('fakeUser')
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken as string
  })

  after(async () => {
    // clean up
    await deleteUser(user.id)
  })

  describe('POST /article/save', () => {
    const url = 'https://blog.omnivore.app'

    before(() => {
      sinon.replace(
        createTask,
        'enqueueFetchContentJob',
        sinon.fake.resolves('')
      )
    })

    after(() => {
      sinon.restore()
    })

    context('when token and url are valid', () => {
      it('should create an article saving request', async () => {
        const response = await request
          .post('/api/article/save')
          .send({
            url,
            v: '0.2.18',
          })
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Cookie', `auth=${authToken}`)

        expect(response.body.articleSavingRequestId).to.be.a('string')
      })
    })
  })
})
