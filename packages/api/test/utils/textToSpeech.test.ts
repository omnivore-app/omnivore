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
          'MIT spinout Quaise Energy is working to create geothermal wells made from the deepest holes in the world.\n' +
          '\n' +
          'Publication Date:\n' +
          '\n' +
          'June 28, 2022\n' +
          '\n' +
          "A graphic depicting the heat at the earth's core\n" +
          'Caption:\n' +
          '\n' +
          'Quaise Energy wants to repurpose coal and gas plants into deep geothermal wells by using X-rays to melt rock.\n' +
          '\n' +
          'Credits:\n' +
          '\n' +
          'Image: Collage by MIT News with images courtesy of Quaise Energy\n' +
          '\n' +
          'There’s an abandoned coal power plant in upstate New York that most people regard as a useless relic. But MIT’s Paul Woskov sees things differently.\n' +
          '\n' +
          'Woskov, a research engineer in MIT’s Plasma Science and Fusion Center, notes the plant’s power turbine is still intact and the transmission lines still run to the grid. Using an approach he’s been working on for the last 14 years, he’s hoping it will be back online, completely carbon-free, within the decade.\n' +
          'In fact, Quaise Energy, the company commercializing Woskov’s work, believes if it can retrofit one power plant, the same process will work on virtually every coal and gas power plant in the world.\n' +
          '\n' +
          'Quaise is hoping to accomplish those lofty goals by tapping into the energy source below our feet. The company plans to vaporize enough rock to create the world’s deepest holes and harvest geothermal energy at a scale that could satisfy human energy consumption for millions of years. They haven’t yet solved all the related engineering challenges, but Quaise’s founders have set an ambitious timeline to begin harvesting energy from a pilot well by 2026.\n' +
          '\n' +
          'The plan would be easier to dismiss as unrealistic if it were based on a new and unproven technology. But Quaise’s drilling systems center around a microwave-emitting device called a gyrotron that has been used in research and manufacturing for decades.\n' +
          '\n' +
          '“This will happen quickly once we solve the immediate engineering problems of transmitting a clean beam and having it operate at a high energy density without breakdown,” explains Woskov, who is not formally affiliated with Quaise but serves as an advisor. “It’ll go fast because the underlying technology, gyrotrons, are commercially available. You could place an order with a company and have a system delivered right now — granted, these beam sources have never been used 24/7, but they are engineered to be operational for long time periods. In five or six years, I think we’ll have a plant running if we solve these engineering problems. I’m very optimistic.”\n' +
          'Woskov and many other researchers have been using gyrotrons to heat material in nuclear fusion experiments for decades. It wasn’t until 2008, however, after the MIT Energy Initiative (MITEI) published a request for proposals on new geothermal drilling technologies, that Woskov thought of using gyrotrons for a new application.\n' +
          '\n' +
          '“[Gyrotrons] haven’t been well-publicized in the general science community, but those of us in fusion research understood they were very powerful beam sources — like lasers, but in a different frequency range,” Woskov says. “I thought, why not direct these high-power beams, instead of into fusion plasma, down into rock and vaporize the hole?”\n' +
          '\n' +
          'As power from other renewable energy sources has exploded in recent decades, geothermal energy has plateaued, mainly because geothermal plants only exist in places where natural conditions allow for energy extraction at relatively shallow depths of up to 400 feet beneath the Earth’s surface. At a certain point, conventional drilling becomes impractical because deeper crust is both hotter and harder, which wears down mechanical drill bits.\n' +
          '\n' +
          'Woskov’s idea to use gyrotron beams to vaporize rock sent him on a research journey that has never really stopped. With some funding from MITEI, he began running tests, quickly filling his office with small rock formations he’d blasted with millimeter waves from a small gyrotron in MIT’s Plasma Science and Fusion Center.\n' +
          '\n' +
          'Paul Woskov with blasted rock samples\n' +
          'Woskov displaying samples in his lab in 2016.\n' +
          '\n' +
          'Photo: Paul Rivenberg\n' +
          '\n' +
          'Around 2018, Woskov’s rocks got the attention of Carlos Araque ’01, SM ’02, who had spent his career in the oil and gas industry and was the technical director of MIT’s investment fund The Engine at the time.\n' +
          '\n' +
          'That year, Araque and Matt Houde, who’d been working with geothermal company AltaRock Energy, founded Quaise. Quaise was soon given a grant by the Department of Energy to scale up Woskov’s experiments using a larger gyrotron.\n' +
          '\n' +
          'With the larger machine, the team hopes to vaporize a hole 10 times the depth of Woskov’s lab experiments. That is expected to be accomplished by the end of this year. After that, the team will vaporize a hole 10 times the depth of the previous one — what Houde calls a 100-to-1 hole.\n' +
          '“That’s something [the DOE] is particularly interested in, because they want to address the challenges posed by material removal over those greater lengths — in other words, can we show we’re fully flushing out the rock vapors?” Houde explains. “We believe the 100-to-1 test also gives us the confidence to go out and mobilize a prototype gyrotron drilling rig in the field for the first field demonstrations.”\n' +
          '\n' +
          'Tests on the 100-to-1 hole are expected to be completed sometime next year. Quaise is also hoping to begin vaporizing rock in field tests late next year. The short timeline reflects the progress Woskov has already made in his lab.\n' +
          '\n' +
          "Although more engineering research is needed, ultimately, the team expects to be able to drill and operate these geothermal wells safely. “We believe, because of Paul’s work at MIT over the past decade, that most if not all of the core physics questions have been answered and addressed,” Houde says. “It’s really engineering challenges we have to answer, which doesn’t mean they’re easy to solve, but we’re not working against the laws of physics, to which there is no answer. It's more a matter of overcoming some of the more technical and cost considerations to making this work at a large scale.”\n" +
          '\n' +
          'The company plans to begin harvesting energy from pilot geothermal wells that reach rock temperatures at up to 500 C by 2026. From there, the team hopes to begin repurposing coal and natural gas plants using its system.\n' +
          '\n' +
          '“We believe, if we can drill down to 20 kilometers, we can access these super-hot temperatures in greater than 90 percent of locations across the globe,” Houde says.\n' +
          '\n' +
          'Quaise’s work with the DOE is addressing what it sees as the biggest remaining questions about drilling holes of unprecedented depth and pressure, such as material removal and determining the best casing to keep the hole stable and open. For the latter problem of well stability, Houde believes additional computer modeling is needed and expects to complete that modeling by the end of 2024.\n' +
          '\n' +
          'By drilling the holes at existing power plants, Quaise will be able to move faster than if it had to get permits to build new plants and transmission lines. And by making their millimeter-wave drilling equipment compatible with the existing global fleet of drilling rigs, it will also allow the company to tap into the oil and gas industry’s global workforce.\n' +
          '\n' +
          '“At these high temperatures [we’re accessing], we’re producing steam very close to, if not exceeding, the temperature that today’s coal and gas-fired power plants operate at,” Houde says. “So, we can go to existing power plants and say, ‘We can replace 95 to 100 percent of your coal use by developing a geothermal field and producing steam from the Earth, at the same temperature you’re burning coal to run your turbine, directly replacing carbon emissions.”\n' +
          '\n' +
          'Transforming the world’s energy systems in such a short timeframe is something the founders see as critical to help avoid the most catastrophic global warming scenarios.\n' +
          '\n' +
          '“There have been tremendous gains in renewables over the last decade, but the big picture today is we’re not going nearly fast enough to hit the milestones we need for limiting the worst impacts of climate change,” Houde says. “[Deep geothermal] is a power resource that can scale anywhere and has the ability to tap into a large workforce in the energy industry to readily repackage their skills for a totally carbon free energy source.”\n' +
          '\n' +
          'Related Topics\n' +
          'Related Articles',
      }
      const output = await synthesizeTextToSpeech(input)
      expect(output.audioUrl).to.be.a('string')
      expect(output.speechMarks).to.be.a('array')
      console.log(output.speechMarks)
    })
  })
})
