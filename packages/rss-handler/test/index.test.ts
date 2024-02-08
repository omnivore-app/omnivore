import { expect } from 'chai'
import 'mocha'
import { isOldItem, RssFeedItem } from '../src'

describe('isOldItem', () => {
  it('returns true if item is older than 1 day', () => {
    const item = {
      isoDate: '2020-01-01',
    } as RssFeedItem
    const mostRecentItemTimestamp = Date.now()

    expect(isOldItem(item, mostRecentItemTimestamp)).to.be.true
  })

  it('returns true if item was published at the last fetched time', () => {
    const mostRecentItemTimestamp = Date.now()
    const item = {
      isoDate: new Date(mostRecentItemTimestamp).toISOString(),
    } as RssFeedItem

    expect(isOldItem(item, mostRecentItemTimestamp)).to.be.true
  })
})
