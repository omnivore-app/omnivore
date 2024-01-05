import { expect } from 'chai'
import 'mocha'
import { isOldItem, RssFeedItem } from '../src'

describe('isOldItem', () => {
  it('returns true if item is older than 1 day', () => {
    const item = {
      pubDate: '2020-01-01',
    } as RssFeedItem
    const lastFetchedAt = Date.now()

    expect(isOldItem(item, lastFetchedAt)).to.be.true
  })

  it('returns true if item was published at the last fetched time', () => {
    const lastFetchedAt = Date.now()
    const item = {
      pubDate: new Date(lastFetchedAt).toISOString(),
    } as RssFeedItem

    expect(isOldItem(item, lastFetchedAt)).to.be.true
  })
})
