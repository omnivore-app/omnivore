import axios, { AxiosInstance } from 'axios'
import {
  BedrockClientParams,
  BedrockClientResponse,
  BedrockInvokeParams,
} from '../../../types/Bedrock'
import { aws4Interceptor } from 'aws4-axios'
import { AiClient, Embedding } from '../../../types/AiClient'
import { SUMMARISE_PROMPT } from './prompt'

export class BedrockClient implements AiClient {
  client: AxiosInstance
  tokenLimit = 100_000 // (Perhaps. Not even sure of the validity of this.)
  embeddingLimit = 8000
  constructor(
    params: BedrockClientParams = {
      region: 'us-west-2',
      endpoint: 'https://bedrock-runtime.us-west-2.amazonaws.com',
    }
  ) {
    this.client = axios.create({
      baseURL: params.endpoint,
    })
    const interceptor = aws4Interceptor({
      options: {
        region: params.region,
        service: 'bedrock',
      },
    })

    this.client.interceptors.request.use(interceptor)
    this.client.defaults.headers.common['Accept'] = '*/*'
    this.client.defaults.headers.common['Content-Type'] = 'application/json'
  }

  _extractHttpBody(
    invokeParams: BedrockInvokeParams
  ): Partial<BedrockInvokeParams> {
    const { model: _, prompt, ...httpCommands } = invokeParams
    return { ...httpCommands, prompt: this._wrapPrompt(prompt) }
  }

  _wrapPrompt(prompt: string): string {
    return `\nHuman: ${prompt}\nAssistant:`
  }

  async getEmbeddings(text: string): Promise<Embedding> {
    const { data } = await this.client.post<BedrockClientResponse>(
      `/model/cohere.embed-english-v3/invoke`,
      { texts: [text], input_type: 'clustering' }
    )
    return data.embeddings![0]
  }
  async summarizeText(text: string): Promise<string> {
    const summariseParams = {
      model: 'anthropic.claude-v2',
      max_tokens_to_sample: 8192,
      temperature: 1,
      top_k: 250,
      top_p: 0.999,
      stop_sequences: ['\\n\\Human:'],
      anthropic_version: 'bedrock-2023-05-31',
      prompt: SUMMARISE_PROMPT(text),
    }

    const { data } = await this.client.post<BedrockClientResponse>(
      `/model/${summariseParams.model}/invoke`,
      this._extractHttpBody(summariseParams)
    )
    return data.completion
  }
}
