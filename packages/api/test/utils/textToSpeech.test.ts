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
        text:
          '《太阁立志传5 DX》清洲会议触发教程\n' +
          '玩家要亲历清洲会议事件，需要位于织田家。\n' +
          '清洲会议需要完成以下条件才能触发：\n' +
          '本能寺发生之后，织田信长和织田信忠死亡。\n' +
          '羽柴秀吉、柴田胜家、织田信雄、织田信孝为大名。\n' +
          '清洲城必须为信雄的直辖城，或者清洲城主为信雄一方。\n' +
          '前两个条件都很容易达成，主要是要保证清洲城主为信雄这一条件比较难办，需要玩家控制城主封地。',
        languageCode: 'zh-CN',
        voice: 'zh-CN-XiaochenNeural',
      }
      const output = await synthesizeTextToSpeech(input)
      expect(output.audioUrl).to.be.a('string')
      expect(output.speechMarks).to.be.a('array')
    })
  })
})
