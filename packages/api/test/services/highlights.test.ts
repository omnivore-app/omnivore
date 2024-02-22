import { expect } from 'chai'
import 'mocha'
import { getHighlightLocation } from '../../src/services/highlights'

describe('getHighlightLocation', () => {
  let patch: string
  let location: number

  before(() => {
    location = 109
    patch = `@@ -${location + 1},16 +${location + 1},36 @@
 . We're
+%3Comnivore_highlight%3E
 humbled
@@ -254,16 +254,37 @@
 h in the
+%3C/omnivore_highlight%3E
  coming`
  })

  it('returns highlight location from patch', () => {
    const result = getHighlightLocation(patch)
    expect(result).to.eql(location)
  })
})
