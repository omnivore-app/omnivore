import { AppleNewsHandler } from '../src/websites/apple-news-handler'
import nock from 'nock'

describe('open a simple web page', () => {
  before(() => {
    nock('https://apple.news').get('/AxjzaZaPvSn23b67LhXI5EQ').reply(200, '')
  })

  it('should return a response', async () => {
    const response = await new AppleNewsHandler().preHandle(
      'https://apple.news/AxjzaZaPvSn23b67LhXI5EQ'
    )
    console.log('response', response)
  })
})
