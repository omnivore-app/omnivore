import { env } from '../env'

export interface Feature {
  library_item_id?: string
  title: string
  has_thumbnail: boolean
  has_site_icon: boolean
  saved_at: Date
  site?: string
  language?: string
  author?: string
  directionality: string
  word_count?: number
  subscription_type?: string
  folder?: string
  published_at?: Date
  subscription?: string
}

export interface ScoreApiRequestBody {
  user_id: string
  items: Record<string, Feature> // item_id -> feature
}

export type ScoreBody = {
  score: number
}

export type ScoreApiResponse = Record<string, ScoreBody> // item_id -> score

export const getScores = async (
  data: ScoreApiRequestBody
): Promise<ScoreApiResponse> => {
  const API_URL = env.score.apiUrl

  const response = await fetch(API_URL, {
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
