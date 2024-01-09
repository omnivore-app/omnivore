import { Embedding } from './AiClient'

export type BedrockClientParams = {
  region: string
  endpoint: string
}

export type BedrockClientResponse = {
  completion: string
  embedding: Embedding
  embeddings?: Embedding[]
}

export type BedrockInvokeParams = {
  model: string
  max_tokens_to_sample: number
  temperature: number
  top_k: number
  top_p: number
  stop_sequences: string[]
  anthropic_version?: string //TODO: Add the actual params.
  prompt: string
}
