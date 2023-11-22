import { AiClient, Embedding } from '../../../types/AiClient'
import { OpenAI } from 'openai'
import { SUMMARISE_PROMPT } from './prompt'
import { env } from '../../../env'

export type OpenAiParams = {
  apiKey: string // defaults to process.env["OPEN_AI_KEY"]
}

export class OpenAiClient implements AiClient {
  client: OpenAI
  tokenLimit = 4096
  embeddingLimit = 8191

  constructor(openAiParams: OpenAiParams = { apiKey: env.openAiApiKey }) {
    this.client = new OpenAI(openAiParams)
  }

  async getEmbeddings(input: string): Promise<Embedding> {
    const embedding = await this.client.embeddings.create({
      input,
      model: 'text-embedding-ada-002',
    })

    return embedding.data[0].embedding
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `${SUMMARISE_PROMPT(text)}`
    const completion = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      stream: false,
    })

    return completion.choices[0]?.message?.content ?? ''
  }
}
