import { expect } from 'chai'
import 'mocha'
import { Item } from 'rss-parser'
import { isOldItem } from '../src'

describe('isOldItem', () => {
  it('returns true if item is older than 1 day', () => {
    const item = {
      pubDate: '2020-01-01',
    } as Item
    const lastFetchedAt = Date.now()

    expect(isOldItem(item, lastFetchedAt)).to.be.true
  })

  it('returns true if item was published at the last fetched time', () => {
    const lastFetchedAt = Date.now()
    const item = {
      pubDate: new Date(lastFetchedAt).toISOString(),
    } as Item

    expect(isOldItem(item, lastFetchedAt)).to.be.true
  })
})
