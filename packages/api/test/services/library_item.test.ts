import { expect } from 'chai'
import 'mocha'
import { filterItemEvents } from '../../src/services/library_item'
import { parseSearchQuery } from '../../src/utils/search'

describe('filterItemEvents', () => {
  it('returns events if there are quotation marks in the subscription name', () => {
    const query = 'subscription:"Best \\"Omnivore\\""'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        subscription: 'Best "Omnivore"',
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if subscription name equals ignore case', () => {
    const query = 'subscription:substack'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        subscription: 'Substack',
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if site name equals ignore case', () => {
    const query = 'site:youtube'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        siteName: 'YouTube',
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if site name contains the search query', () => {
    const query = 'site:standard'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        siteName: 'Der Standard',
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if domain name contains the search query', () => {
    const query = 'site:stackoverflow.com'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        siteName: 'Stack Overflow',
        originalUrl: 'https://stackoverflow.com/questions/123',
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if top level domain matches', () => {
    const query = 'site:".com"'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        siteName: 'Stack Overflow',
        originalUrl: 'https://stackoverflow.com/questions/123',
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if labels match the search query', () => {
    const query = 'label:foo'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        labelNames: ['foo'],
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if labels contain quotation marks', () => {
    const query = 'label:"foo \\"bar\\""'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        labelNames: ['foo "bar"'],
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if labels contain space', () => {
    const query = 'label:"foo bar"'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        labelNames: ['foo bar'],
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if labels match the search query ignore case', () => {
    const query = 'label:Foo'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        labelNames: ['foo'],
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })

  it('returns events if labels match the search query with multiple labels', () => {
    const query = 'label:foo,bar'
    const ast = parseSearchQuery(query)
    const events = [
      {
        id: '1',
        labelNames: ['foo', 'bar'],
      },
    ]
    const result = filterItemEvents(ast, events)
    expect(result).to.eql(events)
  })
})
