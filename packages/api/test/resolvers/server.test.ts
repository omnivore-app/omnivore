import { request } from '../util'
import 'mocha'

describe('Server', () => {
  it('should respond for health check', async () => {
    return request.get('/_ah/health').expect(200)
  })
})
