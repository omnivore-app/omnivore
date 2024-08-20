import axios from 'axios'
import client from 'prom-client'
import { env } from '../env'
import { registerMetric } from '../prometheus'
import { logError } from '../utils/logger'
import { createWebAuthToken } from '../routers/auth/jwt_helpers'

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

  original_url?: string
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

// use prometheus to monitor the latency of digest score api
const latency = new client.Histogram({
  name: 'omnivore_digest_score_latency',
  help: 'Latency of digest score API in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30, 60],
})

registerMetric(latency)

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
    const start = Date.now()

    try {
      const authToken = await createWebAuthToken(data.user_id)
      if (!authToken) {
        throw Error('could not create auth token')
      }
      const response = await axios.post<ScoreApiResponse>(this.apiUrl, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000, // 20 seconds
      })

      return response.data
    } catch (error) {
      logError(error)

      // Returns a stub score (0) in case of an error
      return Object.keys(data.items).reduce((acc, itemId) => {
        acc[itemId] = { score: 0 }
        return acc
      }, {} as ScoreApiResponse)
    } finally {
      const duration = (Date.now() - start) / 1000 // in seconds
      latency.observe(duration)
    }
  }
}

export const scoreClient = new ScoreClientImpl()
