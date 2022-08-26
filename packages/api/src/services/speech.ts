import { getRepository } from '../entity/utils'
import { Speech, SpeechState } from '../entity/speech'
import { searchPages } from '../elastic/pages'
import { Page, PageType } from '../elastic/types'
import { SortBy, SortOrder } from '../utils/search'
import { synthesizeTextToSpeech } from '../utils/textToSpeech'

export const setSpeechFailure = async (id: string) => {
  // update state
  await getRepository(Speech).update(id, {
    state: SpeechState.FAILED,
  })
}

/*
 * We should not synthesize the page when:
 ** 1. User has no recent listens the last 30 days
 ** 2. User has a recent listen but the page was saved after the listen
 */
export const shouldSynthesize = async (
  userId: string,
  page: Page
): Promise<boolean> => {
  return Promise.resolve(false)
  // if (page.pageType === PageType.File || !page.content) {
  //   // we don't synthesize files for now
  //   return false
  // }

  // if (process.env.TEXT_TO_SPEECH_BETA_TEST) {
  //   return true
  // }

  // const [recentListenedPage, count] = (await searchPages(
  //   {
  //     dateFilters: [
  //       {
  //         field: 'listenedAt',
  //         startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  //       },
  //     ],
  //     sort: {
  //       by: SortBy.LISTENED,
  //       order: SortOrder.DESCENDING,
  //     },
  //     size: 1,
  //   },
  //   userId
  // )) || [[], 0]
  // if (count === 0) {
  //   return false
  // }
  // return (
  //   !!recentListenedPage[0].listenedAt &&
  //   page.savedAt < recentListenedPage[0].listenedAt
  // )
}

export const synthesize = async (page: Page, speech: Speech): Promise<void> => {
  try {
    if (page.pageType === PageType.File || !page.content) {
      // we don't synthesize files for now
      return
    }

    console.log('Start synthesizing', { pageId: page.id, speechId: speech.id })
    const startTime = Date.now()
    const speechOutput = await synthesizeTextToSpeech({
      id: speech.id,
      text: page.content,
      languageCode: page.language,
      voice: speech.voice,
      textType: 'ssml',
    })
    console.log('Synthesized article', {
      audioFileName: speechOutput.audioFileName,
      speechMarksFileName: speechOutput.speechMarksFileName,
      duration: Date.now() - startTime,
    })

    // set state to completed
    await getRepository(Speech).update(speech.id, {
      audioFileName: speechOutput.audioFileName,
      speechMarksFileName: speechOutput.speechMarksFileName,
      state: SpeechState.COMPLETED,
    })
  } catch (error) {
    console.log('Error synthesize article', error)
    await setSpeechFailure(speech.id)
    throw error
  }
}
