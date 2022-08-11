import 'mocha'
import {
  createAudioWithSpeechMarks,
  TextToSpeechInput,
} from '../../src/utils/textToSpeech'
import { expect } from 'chai'
import { generateFakeUuid } from '../util'

describe('textToSpeech', () => {
  describe('createAudioWithSpeechMarks', () => {
    it('should create an audio file with speech marks', async () => {
      const input: TextToSpeechInput = {
        id: generateFakeUuid(),
        title: 'Hello World',
        text: 'Hello World',
        engine: 'standard',
      }
      const output = await createAudioWithSpeechMarks(input)
      expect(output.audioUrl).to.be.a('string')
      expect(output.speechMarks).to.be.a('string')
    })
  })
})
