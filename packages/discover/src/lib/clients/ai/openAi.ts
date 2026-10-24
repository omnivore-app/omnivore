import { AiClient, Embedding } from '../../../types/AiClient'
import { OpenAI } from 'openai'
import { SUMMARISE_PROMPT } from './prompt'
import { env } from '../../../env'
import { OmnivoreArticle } from '../../../types/OmnivoreArticle'
import { prepareTitle } from '../../ai/embedding'

export type OpenAiParams = {
  apiKey: string // defaults to process.env["OPEN_AI_KEY"]
}

export class OpenAiClient implements AiClient {
  client: OpenAI
  tokenLimit = 4096
  embeddingLimit = 8191
  selectQuery: string
  insertQuery: string

  constructor(
    openAiParams: OpenAiParams = {
      apiKey: env.openAiApiKey ?? 'default_api-key',
    }
  ) {
    this.client = new OpenAI(openAiParams)
    this.selectQuery = `SELECT name, subject, similarity
     FROM (SELECT discover_topic_name as name, discover_topic_subject as subject, (ABS(embed.embedding <#> $1)) AS "similarity" FROM omnivore.omnivore.discover_topic_embedding_link embed)  topics
     ORDER BY similarity desc`

    this.insertQuery =
      'INSERT INTO omnivore.discover_topic_embedding_link(discover_topic_name, discover_topic_subject, embedding_description, embedding) VALUES($1, $2, $3, $4)';
  }

  async getEmbeddings(article: OmnivoreArticle): Promise<Embedding> {
    const embedding = await this.client.embeddings.create({
      input: `${prepareTitle(article)}: ${article.summary}`,
      model: 'text-embedding-ada-002',
    })

    return embedding.data[0].embedding
  }

  thresholdFilter(score: { similarity: number }): Boolean {
    return score.similarity > 0.77
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `${SUMMARISE_PROMPT(text)}`
    const completion = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      stream: false,
    })

    return completion.choices[0]?.message?.content ?? ''
  }
}
