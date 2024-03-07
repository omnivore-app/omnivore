import { expect } from 'chai'
import 'mocha'
import { validatedDate } from '../../src/utils/helpers'

describe('validatedDate', () => {
  it('doesnt fail if the date is undefined', () => {
    const result = validatedDate(undefined)
    expect(result).to.be.undefined
  })
  it('returns a correct date if the date is in range', () => {
    const d = new Date('2021-09-01')
    const result = validatedDate(d)
    expect(result).to.eql(d)
  })
  it('returns undefined if the date is out of range', () => {
    const d = new Date('10001-09-01')
    const result = validatedDate(d)
    expect(result).to.be.undefined
  })
})
