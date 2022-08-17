import 'mocha'
import {
  synthesizeTextToSpeech,
  TextToSpeechInput,
} from '../../src/utils/textToSpeech'
import { expect } from 'chai'
import { generateFakeUuid } from '../util'

describe('textToSpeech', () => {
  describe('createAudioWithSpeechMarks', () => {
    it('should create an audio file with speech marks', async () => {
      const input: TextToSpeechInput = {
        id: generateFakeUuid(),
        text: 'Marry had a little lamb',
        languageCode: 'en-US',
        voice: 'en-US-JennyNeural',
      }
      const output = await synthesizeTextToSpeech(input)
      expect(output.audioUrl).to.be.a('string')
      expect(output.speechMarksUrl).to.be.a('string')
    })
  })
})
