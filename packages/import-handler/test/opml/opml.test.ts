import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import * as fs from 'fs'
import 'mocha'
import { ArticleSavingRequestStatus, ImportContext } from '../../src'
import { importOpml } from '../../src/opml'
import { stubImportCtx } from '../util'

chai.use(chaiString)

describe('Test OPML importer', () => {
  let stub: ImportContext

  beforeEach(() => {
    stub = stubImportCtx()
  })

  afterEach(async () => {
    await stub.redisClient.quit()
  })

  describe('Load a simple OPML file', () => {
    it('should call the handler for each URL', async () => {
      const urls: URL[] = []
      const stream = fs.createReadStream('./test/opml/data/feeds.opml')
      stub.urlHandler = (ctx: ImportContext, url): Promise<void> => {
        urls.push(url)
        return Promise.resolve()
      }

      await importOpml(stub, stream)
      expect(stub.countFailed).to.equal(0)
      expect(stub.countImported).to.equal(2)
      expect(urls).to.eql([
        new URL('https://hnrss.org/newest'),
        new URL('https://google.com'),
      ])
    })
    it('increments the failed count when the URL is invalid', async () => {
      const stream = fs.createReadStream('./test/opml/data/feeds.opml')
      stub.urlHandler = (ctx: ImportContext, url): Promise<void> => {
        return Promise.reject('Failed to import url')
      }

      await importOpml(stub, stream)
      expect(stub.countFailed).to.equal(2)
      expect(stub.countImported).to.equal(0)
    })
  })
})
