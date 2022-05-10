import 'mocha'
import { expect } from 'chai'
import 'chai/register-should'
import { InFilter, parseSearchQuery, ReadFilter } from '../../src/utils/search'
import { PageType } from '../../src/generated/graphql'

describe('undefined query', () => {
  it('returns an empty result with read state ALL and no typeFilter', () => {
    const result = parseSearchQuery(undefined)
    expect(result.query).to.be.undefined
    expect(result.readFilter).to.eq(ReadFilter.ALL)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('empty query', () => {
  it('returns an empty result with read state ALL and no typefilter', () => {
    const result = parseSearchQuery('')
    expect(result.query).to.be.undefined
    expect(result.readFilter).to.eq(ReadFilter.ALL)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('query with READ read state', () => {
  it('returns a READ result', () => {
    const result = parseSearchQuery('is:read')
    expect(result.query).to.be.undefined
    expect(result.readFilter).to.eq(ReadFilter.READ)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('query with UNREAD read state', () => {
  it('returns a UNREAD result', () => {
    const result = parseSearchQuery('is:unread')
    expect(result.query).to.be.undefined
    expect(result.readFilter).to.eq(ReadFilter.UNREAD)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('query with multiple read states', () => {
  it('just uses the last one', () => {
    const result = parseSearchQuery('is:unread is:read')
    expect(result.query).to.be.undefined
    expect(result.readFilter).to.eq(ReadFilter.READ)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('query with invalid read states', () => {
  it('returns ALL', () => {
    const result = parseSearchQuery('is:invalid')
    expect(result.query).to.be.undefined
    expect(result.readFilter).to.eq(ReadFilter.ALL)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('query with read state before search query', () => {
  it('sets read state and query', () => {
    const result = parseSearchQuery('is:read "machine learning"')
    expect(result.query).to.eq(`"machine learning"`)
    expect(result.readFilter).to.eq(ReadFilter.READ)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('query with read state after search query', () => {
  it('sets read state and query', () => {
    const result = parseSearchQuery('machine learning techniques is:read')
    expect(result.query).to.eq(`machine learning techniques`)
    expect(result.readFilter).to.eq(ReadFilter.READ)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('query with quoted text', () => {
  it('sets the text as quoted and returns the default read state', () => {
    const result = parseSearchQuery('"machine learning" techniques"')
    expect(result.query).to.eq(`"machine learning" techniques`)
    expect(result.readFilter).to.eq(ReadFilter.ALL)
    expect(result.typeFilter).to.be.undefined
  })
})

describe('query with a file type', () => {
  it('sets the type to the supplied type', () => {
    const result = parseSearchQuery('"my string" type:file"')
    expect(result.query).to.eq(`"my string"`)
    expect(result.readFilter).to.eq(ReadFilter.ALL)
    expect(result.typeFilter).to.eq(PageType.File)
  })
})

describe('query with an article type', () => {
  it('sets the type to the supplied type', () => {
    const result = parseSearchQuery('"my string" type:article"')
    expect(result.query).to.eq(`"my string"`)
    expect(result.readFilter).to.eq(ReadFilter.ALL)
    expect(result.typeFilter).to.eq(PageType.Article)
  })
})

describe('query with pdf as its type', () => {
  it('sets the type to the supplied file type', () => {
    const result = parseSearchQuery('"my string" type:pdf"')
    expect(result.query).to.eq(`"my string"`)
    expect(result.readFilter).to.eq(ReadFilter.ALL)
    expect(result.typeFilter).to.eq(PageType.File)
  })
})

describe('query without in param set', () => {
  it('returns ALL if there is a search term', () => {
    const result = parseSearchQuery('my search')
    expect(result.query).to.eq(`my search`)
    expect(result.inFilter).to.eq(InFilter.ALL)
  })
  it('returns INBOX if there is not a search term', () => {
    const result = parseSearchQuery('')
    expect(result.inFilter).to.eq(InFilter.INBOX)
  })
  it('returns INBOX if the search term is undefined', () => {
    const result = parseSearchQuery(undefined)
    expect(result.inFilter).to.eq(InFilter.INBOX)
  })
})

describe('query with in param set', () => {
  it('returns set value if there is a search term', () => {
    const result = parseSearchQuery('my search in:archive')
    expect(result.query).to.eq(`my search`)
    expect(result.inFilter).to.eq(InFilter.ARCHIVE)
  })
  it('returns set value if there is not a search term', () => {
    const result = parseSearchQuery('in:archive')
    expect(result.inFilter).to.eq(InFilter.ARCHIVE)
  })
})

describe('query with in param set to invalid value', () => {
  it('returns all if there is a query', () => {
    const result = parseSearchQuery('my search in:blahblah')
    expect(result.query).to.eq(`my search`)
    expect(result.inFilter).to.eq(InFilter.ALL)
  })
  it('returns set value if there is not a search term', () => {
    const result = parseSearchQuery('in:blahblah')
    expect(result.inFilter).to.eq(InFilter.INBOX)
  })
})
