import { parseErrorCodes } from './../../lib/queryParamParser'

describe('the parseErrorCodes function', () => {
  it('returns an error code from a url query string', () => {
    const query = { errorCodes: 'AUTH_FAILED' }
    const parsedCodes = parseErrorCodes(query)

    expect(parsedCodes).toEqual('AUTH_FAILED')
  })

  it('returns an the first error code from multiple codes', () => {
    const query = {
      errorCodes: 'ACCESS_DENIED,AUTH_FAILED,INVALID_CREDENTIALS',
    }
    const parsedCodes = parseErrorCodes(query)

    expect(parsedCodes).toEqual('ACCESS_DENIED')
  })

  it('returns undefined from an unparseable string', () => {
    const query = { errorCodes: ',,' }
    const parsedCodes = parseErrorCodes(query)

    expect(parsedCodes).toEqual(undefined)
  })
})
