import 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import * as fs from 'fs'
import { importMatterHistory } from '../../src/matterHistory'

chai.use(chaiString)

describe('Load a simple _matter_history file', () => {
  it('should find the URL of each row', async () => {
    const urls: URL[] = []
    const stream = fs.createReadStream('./test/matter/data/_matter_history.csv')
    const count = await importMatterHistory(stream, (url): Promise<void> => {
      urls.push(url)
      return Promise.resolve()
    })
    expect(count).to.equal(1)
    expect(urls).to.eql([
      new URL('https://www.bloomberg.com/features/2022-the-crypto-story/'),
    ])
  })
})
