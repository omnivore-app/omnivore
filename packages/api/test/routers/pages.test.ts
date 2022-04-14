import { request } from '../util'
import 'mocha'

describe('Upload Router', () => {
  const token = process.env.PUBSUB_VERIFICATION_TOKEN || ''

  describe('upload', () => {
    it('upload data to GCS', async () => {
      const data = {
        message: {
          data: Buffer.from(JSON.stringify({ userId: 'userId', type: 'page' })).toString(
            'base64'
          ),
          publishTime: new Date().toISOString(),
        },
      }
      await request
        .post(`/svc/pubsub/upload/createdEntity?token=${token}`)
        .send(data)
        .expect(200)
    })
  })
})
