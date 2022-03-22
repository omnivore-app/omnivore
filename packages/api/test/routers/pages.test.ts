import { request } from '../util'
import 'mocha'

describe('Pages Router', () => {
  const token = process.env.PUBSUB_VERIFICATION_TOKEN || ''

  describe('upload', () => {
    it('upload data to GCS', async () => {
      const data = {
        message: {
          data: Buffer.from(JSON.stringify({ userId: 'userId' })).toString(
            'base64'
          ),
          publishTime: new Date().toISOString(),
        },
      }
      await request
        .post(`/svc/pubsub/pages/upload/createdPage?token=${token}`)
        .send(data)
        .expect(200)
    })
  })
})
