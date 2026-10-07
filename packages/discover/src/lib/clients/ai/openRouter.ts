import { AiClient, Embedding } from '../../../types/AiClient'
import { OpenRouter } from '@openrouter/sdk'
import { SUMMARISE_PROMPT } from './prompt'
import { env } from '../../../env'
import { CreateEmbeddingsResponseBody } from '@openrouter/sdk/models/operations'
import { ChatResult } from '@openrouter/sdk/models'
import { prepareTitle } from '../../ai/embedding'
import { OmnivoreArticle } from '../../../types/OmnivoreArticle'

export type OpenRouterParams = {
  apiKey: string // defaults to process.env["OPENROUTER_API_KEY"]
  embeddingModel: string,
  summarizationModel: string
}

export class OpenRouterClient implements AiClient {
  client: OpenRouter
  tokenLimit = 4096
  embeddingLimit = 8191
  selectQuery: string
  insertQuery: string
  private readonly embeddingModel: string
  private readonly summarizationModel: any

  constructor(
    openRouterParams: OpenRouterParams = {
      apiKey: env.openRouterApiKey ?? 'default_api-key',
      embeddingModel: env.openRouterEmbeddingModel,
      summarizationModel: env.openRouterSummarizationModel,
    }
  ) {
    this.client = new OpenRouter({
      apiKey: openRouterParams.apiKey,
    })
    this.embeddingModel = openRouterParams.embeddingModel
    this.summarizationModel = openRouterParams.summarizationModel
    this.selectQuery = `SELECT name, similarity
      FROM (
        SELECT
            discover_topic_name AS name,
            MIN(embed.small_embedding <=> $1::vector) AS similarity
        FROM omnivore.omnivore.discover_topic_embedding_link embed
        group by embed.discover_topic_name
      ) topics
     ORDER BY similarity ASC`

    this.insertQuery =
      'INSERT INTO omnivore.discover_topic_embedding_link(discover_topic_name, embedding_description, small_embedding) VALUES($1, $2, $3)'  }

  thresholdFilter(score: { similarity: number }): Boolean {
    return score.similarity < 0.256;
  }

  async getEmbeddings(article: OmnivoreArticle): Promise<Embedding> {
    const embedding = (await this.client.embeddings.generate({
      requestBody: {
        input:
          this.embeddingModel === 'e5-large-v2'
            ? `query: ${article.title}: ${article.summary}`
            : `${prepareTitle(article)}: ${article.summary}`,
        model: this.embeddingModel,
      },
    })) as CreateEmbeddingsResponseBody

    return embedding.data[0].embedding as number[]
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `${SUMMARISE_PROMPT(text)}`
    const completion = (await this.client.chat.send({
      chatRequest: {
        messages: [{ role: 'user', content: prompt }],
        model: this.summarizationModel,
        stream: false,
      },
    })) as ChatResult

    return completion.choices[0]?.message?.content?.toString() ?? ''
  }
}
