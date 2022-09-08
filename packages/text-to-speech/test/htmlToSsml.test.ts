import 'mocha'
import { expect } from 'chai'
import { htmlToSsmlItems } from '../src/htmlToSsml'

describe('htmlToSsmlItems', () => {
  const TEST_OPTIONS = {
    primaryVoice: 'test-primary',
    secondaryVoice: 'test-secondary',
    language: 'en-US',
    rate: '1.0',
  }

  describe('a simple html file', () => {
    xit('should convert Html to SSML', () => {
      const ssml = htmlToSsmlItems(
        `
      <div id="readability-content">
        <div id="readability-page-1">
          <p>this is some text</p>
        </div>
      </div>
      `,
        TEST_OPTIONS
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(`<p><bookmark mark="3" />this is some text</p>`)
    })
  })
  describe('a file with nested elements', () => {
    xit('should collapse spans into the parent paragraph', () => {
      const ssml = htmlToSsmlItems(
        `
        <div id="readability-content">
          <div class="page" id="readability-page-1">
            <p>
              this is in the first paragraph
              <span>this is in the second span</span>
              this is also in the first paragraph
            </p>
            <p>
              this is in the first paragraph
              <span>this is in the second span</span>
              this is also in the first paragraph
            </p>
          </div>
        </div>
      `,
        TEST_OPTIONS
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(
        `<p><bookmark mark="3" />this is in the first paragraph<bookmark mark="4" />this is in the second span<bookmark mark="3" />this is also in the first paragraph</p>`.trim()
      )
      const text1 = ssml[1].textItems.join('').trim()
      expect(text1).to.equal(
        `<p><bookmark mark="5" />this is in the first paragraph<bookmark mark="6" />this is in the second span<bookmark mark="5" />this is also in the first paragraph</p>`.trim()
      )
    })
    xit('should extract child paragraphs to the top level', () => {
      const ssml = htmlToSsmlItems(
        `
        <div id="readability-content">
          <div>
            <span>
              this is in the first paragraph
              <p>this is in the second paragraph</p>
              this is also in the first paragraph
            </span>
          </div>
        </div>
      `,
        TEST_OPTIONS
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(
        `<p><bookmark mark="3" />this is in the first paragraph<bookmark mark="4" />this is in the second paragraph<bookmark mark="3" />this is also in the first paragraph</p>`.trim()
      )
    })
    xit('should hoist paragraphs in spans to the top level', () => {
      const ssml = htmlToSsmlItems(
        `
        <div id="readability-content">
          <div>
            <p>
              this is in the first paragraph
              <span>this is in the second paragraph</span>
              this is also in the first paragraph
            </p>
          </div>
        </div>
      `,
        TEST_OPTIONS
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(`TBD`.trim())
    })
    xit('should hoist lists to the top level', () => {
      const ssml = htmlToSsmlItems(
        `
        <div id="readability-content">
          <div>
            <p>
              this is in the first paragraph
              <ul><li>this is the first item in a list</li></ul>
              this is also in the first paragraph
            </p>
          </div>
        </div>
      `,
        TEST_OPTIONS
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(`TBD`.trim())
    })
    xit('should hoist headers to the top level', () => {
      const ssml = htmlToSsmlItems(
        `
        <div id="readability-content">
          <div>
            <p>
              this is in the first paragraph
              <h1>this is a header</h1>
              this is also in the first paragraph
            </p>
          </div>
        </div>
      `,
        TEST_OPTIONS
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(`TBD`.trim())
    })
    xit('should hoist blockquotes to the top level', () => {
      const ssml = htmlToSsmlItems(
        `
        <div id="readability-content">
          <div>
            <p>
              this is in the first paragraph
              <blockquote>this is a blockquote</blockquote>
              this is also in the first paragraph
            </p>
          </div>
        </div>
      `,
        TEST_OPTIONS
      )
      const text = ssml[0].textItems.join('').trim()
      expect(text).to.equal(`TBD`.trim())
    })
  })
  describe('a file with blockquotes', () => {
    xit('should convert Html to SSML with complimentary voices', () => {
      const ssml = htmlToSsmlItems(
        `
        <div id="readability-content">  
          <div class="page" id="readability-page-1">
            <p>first</p>
            <blockquote>second</blockquote>
            <p>third</p>
          </div>
        </div>
      `,
        TEST_OPTIONS
      )
      const first = ssml[0].textItems.join('').trim()
      const second = ssml[1].textItems.join('').trim()
      const third = ssml[2].textItems.join('').trim()

      expect(first).to.equal(`<p><bookmark mark="1" />first</p>`)
      expect(second).to.equal(`<p><bookmark mark="2" />second</p>`)
      expect(third).to.equal(`<p><bookmark mark="3" />third</p>`)

      expect(ssml[0].open.trim()).to.equal(
        `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="test-primary"><prosody rate="1" pitch="default">`
      )
      expect(ssml[1].open.trim()).to.equal(
        `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="test-secondary"><prosody rate="1" pitch="default">`
      )
      expect(ssml[2].open.trim()).to.equal(
        `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="test-primary"><prosody rate="1" pitch="default">`
      )
    })
  })
  // For local testing:
  // describe('readability test files', () => {
  //   it('should convert Html to SSML without throwing', async () => {
  //     const g = new glob.GlobSync('../readabilityjs/test/test-pages/*')
  //     console.log('glob: ', glob)
  //     for (const f of g.found) {
  //       const readablePath = `${f}/expected.html`
  //       if (!fs.existsSync(readablePath)) {
  //         continue
  //       }
  //       const html = fs.readFileSync(readablePath, { encoding: 'utf-8' })
  //       const ssmlItems = htmlToSsmlItems(html, TEST_OPTIONS)
  //       console.log('SSML ITEMS', ssmlItems)
  //     }
  //   })
  // })
})
