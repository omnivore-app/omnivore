import { getRepository } from '../entity/utils'
import { Speech, SpeechState } from '../entity/speech'

export const setSpeechFailure = async (id: string) => {
  // update state
  await getRepository(Speech).update(id, {
    state: SpeechState.FAILED,
  })
}
