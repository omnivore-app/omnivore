import { AiClient } from '../../../types/AiClient'
import { OpenAiClient } from './openAi'
import { env } from '../../../env'
import { OpenRouterClient } from './openRouter'

export const client: AiClient = env.openRouterApiKey ?
  new OpenRouterClient({
    apiKey: env.openRouterApiKey,
    summarizationModel: env.openRouterSummarizationModel,
    embeddingModel: env.openRouterEmbeddingModel,
  }) : new OpenAiClient()
