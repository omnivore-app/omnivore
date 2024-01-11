import 'mocha'
import nock from 'nock'
import { expect } from 'chai'
import { fetchAndChecksum } from '../src/index'

describe('fetchAndChecksum', () => {
  it('should hash the content available', async () => {
    nock('https://fake.com', {}).get('/rss.xml').reply(200, 'i am some content')
    const result = await fetchAndChecksum('https://fake.com/rss.xml')
    expect(result?.checksum).to.eq(
      'd6bc10faec048d999d0cf4b2f7103d84557fb9cd94c3bccd17884b1288949375'
    )
  })
})
