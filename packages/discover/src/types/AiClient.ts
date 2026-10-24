import { OmnivoreArticle } from './OmnivoreArticle'

export type Embedding = Array<number>
export interface AiClient {
  getEmbeddings(article: OmnivoreArticle): Promise<Embedding>
  summarizeText(text: string): Promise<string>
  thresholdFilter(score: { similarity: number }): Boolean
  selectQuery: string
  insertQuery: string
  tokenLimit: number
  embeddingLimit: number
}
