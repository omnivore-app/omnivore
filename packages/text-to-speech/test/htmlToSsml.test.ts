import 'mocha'
import { expect } from 'chai'
import { htmlToSsml } from '../src/htmlToSsml'

describe('htmlToSsml', () => {
  const TEST_VOCIES = { primary: 'test-primary', secondary: 'test-secondary' }

  describe('a simple html file', () => {
    it('should convert Html to SSML', async () => {
      const ssml = htmlToSsml(`
        <div class="page" id="readability-page-1">
          <p data-omnivore-anchor-idx="1">this is some text</p>
        </div>
      `, TEST_VOCIES
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(
        `<p><bookmark mark="1" />this is some text</p>`
      )
    })
  })
  describe('a file with nested elements', () => {
    it('should convert Html to SSML', async () => {
      const ssml = htmlToSsml(`
<div class="page" id="readability-page-1">
<p>
this is in the first paragraph
<span>this is in the second span</span>
this is also in the first paragraph
</p>
</div>
      `, TEST_VOCIES
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(
        `<p><bookmark mark="1" /> this is in the first paragraph <bookmark mark="2" />this is in the second span<bookmark mark="1" /> this is also in the first paragraph </p>`.trim()
      )
    })
  })
  describe('a file with blockquotes', () => {
    it('should convert Html to SSML with complimentary voices', async () => {
      const ssml = htmlToSsml(`
<div class="page" id="readability-page-1">
<p>first</p>
<blockquote>second</blockquote>
<p>third</p>
</div>
      `, TEST_VOCIES
      )
      const first = ssml[0].textItems.join('').trim()
      const second = ssml[1].textItems.join('').trim()
      const third = ssml[2].textItems.join('').trim()

      expect(first).to.equal(
        `<p><bookmark mark="1" />first</p>`
      )
      expect(second).to.equal(
        `<p><bookmark mark="2" />second</p>`
      )
      expect(third).to.equal(
        `<p><bookmark mark="3" />third</p>`
      )

      expect(ssml[0].open.trim()).to.equal(
        `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="test-primary"><prosody rate="0%" pitch="0%">`
      )
      expect(ssml[1].open.trim()).to.equal(
        `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="test-secondary"><prosody rate="0%" pitch="0%">`
      )
      expect(ssml[2].open.trim()).to.equal(
        `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="test-primary"><prosody rate="0%" pitch="0%">`
      )
    })
  })
})
