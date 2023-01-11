import 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import * as fs from 'fs'
import { importCsv } from '../../src/csv'
import { ImportContext } from '../../src'
import { stubImportCtx } from '../util'

chai.use(chaiString)

describe('Load a simple CSV file', () => {
  it('should call the handler for each URL', async () => {
    const urls: URL[] = []
    const stream = fs.createReadStream('./test/csv/data/simple.csv')
    const stub = stubImportCtx()
    stub.urlHandler = (ctx: ImportContext, url): Promise<void> => {
      urls.push(url)
      return Promise.resolve()
    }

    await importCsv(stub, stream)
    expect(stub.countFailed).to.equal(0)
    expect(stub.countImported).to.equal(2)
    expect(urls).to.eql([
      new URL('https://omnivore.app'),
      new URL('https://google.com'),
    ])
  })
})
