import { expect } from 'chai'
import 'mocha'
import { validateUrl } from '../../src/services/create_page_save_request'

describe('validateUrl', () => {
  it('allows access to public addresses', () => {
    expect(() => {
      validateUrl('https://google.com')
    }).not.to.throw()
    expect(() => {
      validateUrl('https://omnivore.app/path')
    }).not.to.throw()
  })
  it('doesnt allow access to private addresses', () => {
    expect(() => {
      validateUrl('http://localhost:8080')
    }).to.throw()
    expect(() => {
      validateUrl('http://0.0.0.0')
    }).to.throw()
    expect(() => {
      validateUrl('http://192.168.1.1')
    }).to.throw()
    expect(() => {
      validateUrl('http://169.254.1.1')
    }).to.throw()
  })
  it('doesnt allow access to google private data', () => {
    expect(() => {
      validateUrl('http://metadata.google.internal')
    }).to.throw()
  })
})
