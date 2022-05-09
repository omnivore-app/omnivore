const { expect } = require('chai')
const { appleNewsHandler } = require('../apple-news-handler')

describe('open a simple web page', () => {
  it('should return a response', async () => {
    const response = await appleNewsHandler.prehandle('https://apple.news/AxjzaZaPvSn23b67LhXI5EQ')
    console.log('response', response)
  })
})
