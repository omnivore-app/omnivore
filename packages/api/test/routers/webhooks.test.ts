import { createTestUser, deleteTestUser } from '../db'
import { request } from '../util'
import { User } from '../../src/entity/user'
import 'mocha'
import { getRepository } from '../../src/entity/utils'
import { Webhook } from '../../src/entity/webhook'

describe('Webhooks Router', () => {
  const username = 'fakeUser'
  const token = process.env.PUBSUB_VERIFICATION_TOKEN || ''

  let user: User
  let webhook: Webhook

  before(async () => {
    // create test user and login
    user = await createTestUser(username)
    await request
      .post('/local/debug/fake-user-login')
      .send({ fakeEmail: user.email })

    webhook = await getRepository(Webhook).save({
      url: 'https://example.com',
      user: { id: user.id },
      eventTypes: ['PAGE_CREATED'],
    })
  })

  after(async () => {
    // clean up
    await deleteTestUser(username)
  })

  describe('trigger webhooks', () => {
    it('should trigger webhooks', async () => {
      const data = {
        message: {
          data: Buffer.from(
            JSON.stringify({ userId: user.id, type: 'page' })
          ).toString('base64'),
          publishTime: new Date().toISOString(),
        },
      }

      await request
        .post('/svc/pubsub/webhooks/trigger/created?token=' + token)
        .send(data)
        .expect(200)
    })
  })
})
