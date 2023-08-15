import { createTestUser, deleteTestUser } from '../db'
import { request } from '../util'
import { expect } from 'chai'
import nock from 'nock'
import 'mocha'
import { env } from '../../src/env'
import { User } from '../../src/entity/user'
import sinon from 'sinon'
import * as createTask from '../../src/utils/createTask'

const MOCK_USERNAME = 'fakeuser'

describe('/article/save API', () => {
  let user: User
  let authToken: string

  // We need to mock the pupeeteer-parse
  // service here because in dev mode the task gets
  // called immediately.
  nock(env.queue.contentFetchUrl).post('/').reply(200)

  before(async () => {
    // create test user and login
    user = await createTestUser(MOCK_USERNAME)
    const res = await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    authToken = res.body.authToken
  })

  after(async () => {
    // clean up
    await deleteTestUser(user.id)
  })

  describe('POST /article/save', () => {
    const url = 'https://blog.omnivore.app'

    before(() => {
      sinon.replace(createTask, 'enqueueParseRequest', sinon.fake.resolves(''))
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
