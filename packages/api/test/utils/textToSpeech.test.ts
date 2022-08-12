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
        text: '<speak><mark name="readability-page-1"/>The rumor mill suggests that Google may be looking to kill off its game streaming platform, Stadia, for good before the end of the year.</speak>',
        engine: 'standard',
        textType: 'ssml',
      }
      const output = await createAudioWithSpeechMarks(input)
      expect(output.audioUrl).to.be.a('string')
      expect(output.speechMarks).to.be.a('string')
    })
  })
})
