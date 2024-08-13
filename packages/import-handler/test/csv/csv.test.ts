import { RedisDataSource } from '@omnivore/utils'
import * as chai from 'chai'
import { expect } from 'chai'
import chaiString from 'chai-string'
import * as fs from 'fs'
import 'mocha'
import { ArticleSavingRequestStatus, ImportContext } from '../../src'
import { importCsv } from '../../src/csv'
import { stubImportCtx } from '../util'

chai.use(chaiString)

describe('Test csv importer', () => {
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

  describe('Load a simple CSV file', () => {
    it('should call the handler for each URL', async () => {
      const urls: URL[] = []
      const stream = fs.createReadStream('./test/csv/data/simple.csv')
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

    it('increments the failed count when the URL is invalid', async () => {
      const stream = fs.createReadStream('./test/csv/data/simple.csv')
      stub.urlHandler = (ctx: ImportContext, url): Promise<void> => {
        return Promise.reject('Failed to import url')
      }

      await importCsv(stub, stream)
      expect(stub.countFailed).to.equal(2)
      expect(stub.countImported).to.equal(0)
    })
  })

  describe('Load a complex CSV file', () => {
    it('should call the handler for each URL, state and labels', async () => {
      const results: {
        url: URL
        state?: ArticleSavingRequestStatus
        labels?: string[]
        savedAt?: Date
        publishedAt?: Date
      }[] = []
      const stream = fs.createReadStream('./test/csv/data/complex.csv')
      stub.urlHandler = (
        ctx: ImportContext,
        url,
        state,
        labels,
        savedAt,
        publishedAt
      ): Promise<void> => {
        results.push({
          url,
          state,
          labels,
          savedAt,
          publishedAt,
        })
        return Promise.resolve()
      }

      await importCsv(stub, stream)
      expect(stub.countFailed).to.equal(0)
      expect(stub.countImported).to.equal(3)
      expect(results).to.eql([
        {
          url: new URL('https://omnivore.app'),
          state: 'ARCHIVED',
          labels: ['test'],
          savedAt: undefined,
          publishedAt: undefined,
        },
        {
          url: new URL('https://google.com'),
          labels: ['test', 'development'],
          state: undefined,
          savedAt: undefined,
          publishedAt: undefined,
        },
        {
          url: new URL('https://test.com'),
          state: 'SUCCEEDED',
          labels: ['test', 'development'],
          savedAt: new Date(1692093633000),
          publishedAt: new Date(1692093633000),
        },
      ])
    })
  })

  describe('A file with no status set', () => {
    it('should not try to set status', async () => {
      const states: (ArticleSavingRequestStatus | undefined)[] = []
      const stream = fs.createReadStream('./test/csv/data/unset-status.csv')
      stub.urlHandler = (
        ctx: ImportContext,
        url,
        state?: ArticleSavingRequestStatus
      ): Promise<void> => {
        states.push(state)
        return Promise.resolve()
      }

      await importCsv(stub, stream)
      expect(stub.countFailed).to.equal(0)
      expect(stub.countImported).to.equal(2)
      expect(states).to.eql([undefined, ArticleSavingRequestStatus.Archived])
    })
  })

  describe('A file with some labels', () => {
    it('gets the labels, handles empty, and trims extra whitespace', async () => {
      const importedLabels: (string[] | undefined)[] = []
      const stream = fs.createReadStream('./test/csv/data/labels.csv')
      stub.urlHandler = (
        ctx: ImportContext,
        url,
        state?: ArticleSavingRequestStatus,
        labels?: string[]
      ): Promise<void> => {
        importedLabels.push(labels)
        return Promise.resolve()
      }

      await importCsv(stub, stream)
      expect(stub.countFailed).to.equal(0)
      expect(stub.countImported).to.equal(3)
      expect(importedLabels).to.eql([
        ['Label1', 'Label2', 'Label 3', 'Label 4'],
        [],
        undefined,
      ])
    })
  })
})
