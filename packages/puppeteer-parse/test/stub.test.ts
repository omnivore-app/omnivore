import 'mocha'
import * as chai from 'chai'
import { expect } from 'chai'
import 'chai/register-should'
import chaiString from 'chai-string'

chai.use(chaiString)

describe('Stub test', () => {
  it('should pass', () => {
    expect(true).to.be.true
  })
})
