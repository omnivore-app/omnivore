import { AppleNewsHandler } from '../src/content/apple-news-handler'

describe('open a simple web page', () => {
  it('should return a response', async () => {
    const response = await new AppleNewsHandler().preHandle(
      'https://apple.news/AxjzaZaPvSn23b67LhXI5EQ'
    )
    console.log('response', response)
  })
})
