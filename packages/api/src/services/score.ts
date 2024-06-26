import { env } from '../env'

export interface Feature {
  library_item_id?: string
  title: string
  has_thumbnail: boolean
  has_site_icon: boolean
  saved_at: Date
  item_word_count: number
  is_subscription: boolean
  inbox_folder: boolean
  is_newsletter: boolean
  is_feed: boolean

  site?: string
  language?: string
  author?: string
  directionality: string
  word_count?: number
  subscription_type?: string
  folder?: string
  published_at?: Date
  subscription?: string
  subscription_auto_add_to_library?: boolean
  subscription_fetch_content?: boolean
  days_since_subscribed?: number
  subscription_count?: number
}

export interface ScoreApiRequestBody {
  user_id: string
  items: Record<string, Feature> // item_id -> feature
}

export type ScoreBody = {
  score: number
}

export type ScoreApiResponse = Record<string, ScoreBody> // item_id -> score
interface ScoreClient {
  getScores(data: ScoreApiRequestBody): Promise<ScoreApiResponse>
}

class StubScoreClientImpl implements ScoreClient {
  async getScores(data: ScoreApiRequestBody): Promise<ScoreApiResponse> {
    const stubScore = 1.0

    const stubScores: ScoreApiResponse = {}
    for (const itemId in data.items) {
      stubScores[itemId] = { score: stubScore }
    }

    return Promise.resolve(stubScores)
  }
}

class ScoreClientImpl implements ScoreClient {
  private apiUrl: string

  constructor(apiUrl = env.score.apiUrl) {
    this.apiUrl = apiUrl
  }

  async getScores(data: ScoreApiRequestBody): Promise<ScoreApiResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to score candidates: ${response.statusText}`)
    }

    const scores = (await response.json()) as ScoreApiResponse
    return scores
  }
}

export const scoreClient = new StubScoreClientImpl()
