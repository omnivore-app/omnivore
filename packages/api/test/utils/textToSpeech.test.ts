import 'mocha'
import {
  htmlElementToSsml,
  synthesizeTextToSpeech,
  TextToSpeechInput,
} from '../../src/utils/textToSpeech'
import { expect } from 'chai'
import { generateFakeUuid } from '../util'
import { parseHTML } from 'linkedom'

describe('textToSpeech', () => {
  describe('synthesizeTextToSpeech', () => {
    it('should create an audio file with speech marks', async () => {
      const input: TextToSpeechInput = {
        id: generateFakeUuid(),
        text: 'Marry had a little lamb',
        languageCode: 'en-US',
        voice: 'en-US-JennyNeural',
        textType: 'text',
      }
      const output = await synthesizeTextToSpeech(input)
      expect(output.audioUrl).to.be.a('string')
      expect(output.speechMarksUrl).to.be.a('string')
    })
  })

  describe('htmlElementToSsml', () => {
    it('should convert Html Element to SSML', async () => {
      const htmlElement = parseHTML(
        `<p data-omnivore-anchor-idx="1">Marry had a little lamb</p>`
      ).document.documentElement
      const ssml = htmlElementToSsml(htmlElement)
      expect(ssml).to.equal(
        `<speak xml:lang="en-US" xmlns="http://www.w3.org/2001/10/synthesis" version="1.0"><voice name="en-US-JennyNeural"><prosody volume="100" rate="1"><bookmark mark="data-omnivore-anchor-idx-1"></bookmark>Marry had a little lamb</prosody></voice></speak>`
      )
    })
  })
})
