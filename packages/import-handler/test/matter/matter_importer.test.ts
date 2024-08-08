import { Readability } from '@omnivore/readability'
import { RedisDataSource } from '@omnivore/utils'
import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import * as fs from 'fs'
import 'mocha'
import { ImportContext } from '../../src'
import {
  importMatterArchive,
  importMatterHistoryCsv,
} from '../../src/matterHistory'
import { stubImportCtx } from '../util'

chai.use(chaiString)

describe('matter importer', () => {
  let stub: ImportContext
  let redisDataSource: RedisDataSource

  beforeEach(() => {
    redisDataSource = new RedisDataSource({
      cache: {
        url: process.env.REDIS_URL,
        cert: process.env.REDIS_CERT,
      },
      mq: {
        url: process.env.MQ_REDIS_URL,
        cert: process.env.MQ_REDIS_CERT,
      },
    })

    stub = stubImportCtx(redisDataSource)
  })

  afterEach(async () => {
    await redisDataSource.shutdown()
  })

  describe('Load a simple _matter_history file', () => {
    it('should find the URL of each row', async () => {
      const urls: URL[] = []
      const stream = fs.createReadStream(
        './test/matter/data/_matter_history.csv'
      )
      stub.urlHandler = (ctx: ImportContext, url): Promise<void> => {
        urls.push(url)
        return Promise.resolve()
      }

      await importMatterHistoryCsv(stub, stream)
      expect(stub.countFailed).to.equal(0)
      expect(stub.countImported).to.equal(1)
      expect(urls).to.eql([
        new URL('https://www.bloomberg.com/features/2022-the-crypto-story/'),
      ])
    })
  })

  describe('Load archive file', () => {
    it('should find the URL of each row', async () => {
      const urls: URL[] = []
      const stream = fs.createReadStream('./test/matter/data/Archive.zip')
      stub.contentHandler = (
        ctx: ImportContext,
        url: URL,
        title: string,
        originalContent: string,
        parseResult: Readability.ParseResult
      ): Promise<void> => {
        urls.push(url)
        return Promise.resolve()
      }

      await importMatterArchive(stub, stream)
      expect(stub.countFailed).to.equal(0)
      expect(stub.countImported).to.equal(1)
      expect(urls).to.eql([
        new URL('https://www.bloomberg.com/features/2022-the-crypto-story/'),
      ])
    })
  })
})
