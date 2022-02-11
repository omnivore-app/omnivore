import { request } from '../util'

describe('Server', () => {
  it('should respond for health check', async () => {
    return request.get('/_ah/health').expect(200)
  })
})
