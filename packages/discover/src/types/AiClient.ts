export type Embedding = Array<number>
export interface AiClient {
  getEmbeddings(text: string): Promise<Embedding>
  summarizeText(text: string): Promise<string>
  tokenLimit: number
  embeddingLimit: number
}
