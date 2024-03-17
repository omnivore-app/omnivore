import { expect } from 'chai'
import 'mocha'
import { addTranscriptChapters } from '../../src/jobs/process-youtube-video'

describe('create transcript', () => {
  describe('build items', () => {
    it('properly adds chapter headers to transcript', async () => {
      const chapters = [
        {
          title: 'Intro',
          start: 0,
        },
        {
          title: "Joe Biden's re-election effort",
          start: 22000,
        },
        {
          title: 'Ad break',
          start: 909000,
        },
        {
          title: "Trump's crazy speech & Orbán relationship",
          start: 1060000,
        },
      ]
      const transcript = [
        {
          text: "welcome to pod save America I'm John",
          duration: 3280,
          start: 80,
        },
        {
          text: "favro I'm John L I'm Tommy VOR on",
          duration: 3480,
          start: 1480,
        },
        {
          text: "today's show Donald Trump kicks off the",
          duration: 3320,
          start: 3360,
        },
        {
          text: 'general election by mocking Joe Biden',
          duration: 3400,
          start: 4960,
        },
        {
          text: 'stutter hosting a concert for Victor',
          duration: 3680,
          start: 6680,
        },
        {
          text: 'Orban and floating cuts to Medicare and',
          duration: 4239,
          start: 8360,
        },
        {
          text: 'Social Security Alabama Senator Katie',
          duration: 3840,
          start: 10360,
        },
        {
          text: 'Brit and Republicans are still dealing',
          duration: 3401,
          start: 12599,
        },
        {
          text: 'with the Fallout from what may have been',
          duration: 3320,
          start: 14200,
        },
        {
          text: 'the worst ever State of the Union',
          duration: 4600,
          start: 16000,
        },
        {
          text: 'response and later take appreciator is',
          duration: 6640,
          start: 17520,
        },
        {
          text: 'back so is Elijah uh but first the man',
          duration: 6519,
          start: 20600,
        },
        {
          text: 'Sean Hannity now calls jacked up Joe has',
          duration: 4680,
          start: 24160,
        },
      ]

      const res = addTranscriptChapters(chapters, transcript)
      console.log('res: ', res)

      expect(res.length).to.eq(17)
      expect(res[13].text).to.eq("\n\n## Joe Biden's re-election effort\n\n")
    })
  })
})
