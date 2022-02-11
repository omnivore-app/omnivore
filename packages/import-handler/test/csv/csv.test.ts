import 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import 'chai/register-should'
import chaiString from 'chai-string'
import * as fs from 'fs'
import { importCsv } from '../../src/csv'

chai.use(chaiString)

describe('Load a simple CSV file', () => {
  it('should call the handler for each URL', async () => {
    const urls: URL[] = []
    const stream = fs.createReadStream('./test/csv/data/simple.csv')
    const count = await importCsv(stream, (url): Promise<void> => {
      urls.push(url)
      return Promise.resolve()
    })
    expect(count).to.equal(2)
    expect(urls).to.eql([
      new URL('https://omnivore.app'),
      new URL('https://google.com'),
    ])
  })
})
