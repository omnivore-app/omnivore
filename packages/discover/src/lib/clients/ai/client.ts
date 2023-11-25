import { AiClient } from '../../../types/AiClient'
import { OpenAiClient } from './openAi'

export const client: AiClient = new OpenAiClient()
