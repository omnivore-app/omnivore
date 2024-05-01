import { expect } from 'chai'
import * as fs from 'fs'
import 'mocha'
import path from 'path'
import {
  htmlToSpeechFile,
  htmlToSsmlItems,
  stripEmojis,
} from '../src/htmlToSsml'

const TEST_OPTIONS = {
  primaryVoice: 'test-primary',
  secondaryVoice: 'test-secondary',
  language: 'en-US',
  rate: '1.0',
}

const load = (filename: string) => {
  return fs.readFileSync(path.join(__dirname, filename), 'utf8')
}

describe('stripEmojis', () => {
  it('strips emojis from text and removes the extra space', () => {
    const text = '🥛The Big Short guy is back with a new prediction'

    expect(stripEmojis(text)).to.equal(
      'The Big Short guy is back with a new prediction'
    )
  })

  it('strips emojis from html and removes the extra space', () => {
    const text = `<h2 data-omnivore-anchor-idx="37">🧠Brain food</h2>`

    expect(stripEmojis(text)).to.equal(
      `<h2 data-omnivore-anchor-idx="37">Brain food</h2>`
    )
  })
})

describe('htmlToSpeechFile', () => {
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

describe('convert HTML to Speech file', () => {
  it('converts each <li> to an utterance', () => {
    const html = load('./fixtures/li.html')

    const speechFile = htmlToSpeechFile({
      content: html,
      title: 'Wang Yi at the UN; Fu Zhenghua sentenced; Nvidia China sales',
      options: TEST_OPTIONS,
    })
    expect(speechFile.utterances).to.have.lengthOf(21)
  })

  it('converts long utterances to multiple utterances', () => {
    const html = `<div id="readability-content">
  <div class="page" id="readability-page-1">
    <div data-omnivore-anchor-idx="1">
      All neural voices are multilingual and fluent in their own language and English. For example, if the input text in English is "I'm excited to try text to speech" and you set es-ES-ElviraNeural, the text is spoken in English with a Spanish accent. If the voice doesn't speak the language of the input text, the Speech service won't output synthesized audio. See the full list of supported neural voices.
    </div>
  </div>
</div>
`
    const speechFile = htmlToSpeechFile({
      content: html,
      title: 'How to synthesize speech from text',
      options: TEST_OPTIONS,
    })
    expect(speechFile.utterances).to.have.lengthOf(3)
  })

  it('does not break long sentences', () => {
    const html = `<div id="readability-content">
  <div class="page" id="readability-page-1">
    <div data-omnivore-anchor-idx="1">
      This meeting did not offer any significant economic boosts, among other things it reviewed reports of the inspection teams sent to several provinces to check on implementation of economic stabilization measures, promised more administrative reforms, and cut toll fees for freight trucks by 10% and government-designated cargo port charges by 20% in Q4.
    </div>
  </div>
</div>
`
    const speechFile = htmlToSpeechFile({
      content: html,
      title: 'Test long sentence',
      options: TEST_OPTIONS,
    })
    expect(speechFile.utterances).to.have.lengthOf(2)
  })

  it('does not break on not decimal point in sentences', () => {
    const html = `<div id="readability-content">
  <div class="page" id="readability-page-1">
    <div data-omnivore-anchor-idx="1">
      If terms of the original $12.5 billion financing package remain the same, bankers may struggle to sell the risky Twitter buyout debt just as credit markets begin to crack, with yields at multiyear highs, they’re potentially on the hook for hundreds of millions of dollars of losses on the unsecured portion alone should they try to unload it to investors.
    </div>
  </div>
</div>
`
    const speechFile = htmlToSpeechFile({
      content: html,
      title: 'Test long sentence with decimal point',
      options: TEST_OPTIONS,
    })
    expect(speechFile.utterances[1].text).to.eql(
      "If terms of the original $12.5 billion financing package remain the same, bankers may struggle to sell the risky Twitter buyout debt just as credit markets begin to crack, with yields at multiyear highs, they're potentially on the hook for hundreds of millions of dollars of losses on the unsecured portion alone should they try to unload it to investors."
    )
  })

  it('splits sentences correctly in a blockquote element', () => {
    const html = load('./fixtures/blockquote.html')

    const speechFile = htmlToSpeechFile({
      content: html,
      options: TEST_OPTIONS,
    })

    expect(speechFile.utterances).to.have.lengthOf(5)
    expect(speechFile.utterances[0].text).to.eql(
      'Just for curiosity, how do you pick the articles for Slow Chinese? Any advice on finding opportunities to communicate in Chinese? What are your tips to improve comprehension? '
    )
    expect(speechFile.utterances[1].text).to.eql(
      `I feel like I'm working on reading, listening, and speaking all at once, sometimes I feel like I'm just getting surface understanding. `
    )
  })

  it('splits sentences in German correctly', () => {
    const html = `<div class="page" id="readability-page-1" data-omnivore-anchor-idx="1">
<p data-omnivore-anchor-idx="2"><span data-omnivore-anchor-idx="3"><span data-omnivore-anchor-idx="4"><strong data-omnivore-anchor-idx="5"><em data-omnivore-anchor-idx="6"><span data-omnivore-anchor-idx="7" lang="DE" xml:lang="DE"><span data-omnivore-anchor-idx="8">Q</span></span></em></strong><em data-omnivore-anchor-idx="9"><span data-omnivore-anchor-idx="10" lang="DE" xml:lang="DE"><span data-omnivore-anchor-idx="11"><strong data-omnivore-anchor-idx="12">:</strong> „Die kürzliche Razzia in den BBC-Büros in Delhi sind ein weiterer Versuch der Regierung, kritische Medien-Kommentare zu unterdrücken. Man hat des Gefühl, Herr Modi hat Angst, in den Spiegel zu schauen!?“</span></span></em></span></span></p>
</div>`
    const speechFile = htmlToSpeechFile({
      content: html,
      options: TEST_OPTIONS,
    })
    expect(speechFile.utterances).to.have.lengthOf(1)
    expect(speechFile.utterances[0].text).to.eql(
      'Q: „Die kürzliche Razzia in den BBC-Büros in Delhi sind ein weiterer Versuch der Regierung, kritische Medien-Kommentare zu unterdrücken. Man hat des Gefühl, Herr Modi hat Angst, in den Spiegel zu schauen!?"'
    )
  })

  it('splits sentences in Chinese correctly', () => {
    const html = `<div class="page" id="readability-page-1" data-omnivore-anchor-idx="1">
  <p data-omnivore-anchor-idx="2">这是一段中文，我想看看它是怎么分句的。如果买二手房有中介参与，要找相对大的、知名的中介。中介的收费、服务情况要先问清。还要和中介谈好，中介费的付款时间，一般来说是签完合同付一部分，过户后付一部分，省的太早付完钱，中介就不管事了。付完记得要发票。中介如果提供贷款服务，让他玩去。贷款之类的问题，别怕麻烦，自己去找银行。</p>
</div>`
    const speechFile = htmlToSpeechFile({
      content: html,
      options: TEST_OPTIONS,
    })
    expect(speechFile.utterances).to.have.lengthOf(1)
    expect(speechFile.utterances[0].text).to.eql(
      '这是一段中文，我想看看它是怎么分句的。如果买二手房有中介参与，要找相对大的、知名的中介。中介的收费、服务情况要先问清。还要和中介谈好，中介费的付款时间，一般来说是签完合同付一部分，过户后付一部分，省的太早付完钱，中介就不管事了。付完记得要发票。中介如果提供贷款服务，让他玩去。贷款之类的问题，别怕麻烦，自己去找银行。'
    )
  })

  it('parses the smart quotes correctly', () => {
    const html = `
    <div class="page" id="readability-page-1" data-omnivore-anchor-idx="1">
      <p data-omnivore-anchor-idx="23">Nor was Stalin any kind of naïve, unsuspecting victim of Hitler’s <a data-omnivore-anchor-idx="24" href="https://archive.ph/o/AGEPn/https://www.britannica.com/event/Operation-Barbarossa" rel="noopener noreferrer" target="_blank" title="">Barbarossa onslaught</a>, as some historical clichés would have it. McMeekin makes an extended case that Stalin was preparing to attack Nazi Germany when Hitler attacked him, that the two dictators were basically in a race to see who could mobilize to betray the other first — and that the initial Soviet debacle in 1941 happened in part because Stalin was also pushing his military toward an offensive alignment, and they were caught in a “mid-mobilization limbo.”</p>
    </div>
    `

    const speechFile = htmlToSpeechFile({
      content: html,
      options: TEST_OPTIONS,
    })
    expect(speechFile.utterances).to.have.lengthOf(2)
    expect(speechFile.utterances[1].text).to.eql(
      'McMeekin makes an extended case that Stalin was preparing to attack Nazi Germany when Hitler attacked him, that the two dictators were basically in a race to see who could mobilize to betray the other first — and that the initial Soviet debacle in 1941 happened in part because Stalin was also pushing his military toward an offensive alignment, and they were caught in a "mid-mobilization limbo."'
    )
  })

  it('skip unwanted elements', () => {
    const html = `<div class="page" id="readability-page-1" data-omnivore-anchor-idx="1">
      <p data-omnivore-anchor-idx="2">This is a test.</p>
      <script data-omnivore-anchor-idx="3">alert('hello');</script>
      <style data-omnivore-anchor-idx="4">body { color: red; }</style>
      <iframe data-omnivore-anchor-idx="6" src="https://example.com">test</iframe>
      <figcaption data-omnivore-anchor-idx="7">test</figcaption>
      </div>`

    const speechFile = htmlToSpeechFile({
      content: html,
      options: TEST_OPTIONS,
    })
    expect(speechFile.utterances).to.have.lengthOf(1)
    expect(speechFile.utterances[0].text).to.eql('This is a test.')
  })

  it('filters out utterances with only punctuation or whitespace', () => {
    const html = `<div class="page" id="readability-page-1" data-omnivore-anchor-idx="1">
      <p data-omnivore-anchor-idx="2">This is a test.</p>
      <p data-omnivore-anchor-idx="3">.</p>
      <p data-omnivore-anchor-idx="4"> </p>
      </div>`

    const speechFile = htmlToSpeechFile({
      content: html,
      options: TEST_OPTIONS,
    })

    expect(speechFile.utterances).to.have.lengthOf(1)
    expect(speechFile.utterances[0].text).to.eql('This is a test.')
  })
})
