import { redisDataSource } from '../redis_data_source'
import { SpeechFile } from '@omnivore/text-to-speech-handler'

export const CREATE_DIGEST_JOB = 'create-digest'

export interface CreateDigestJobData {
  userId: string
}

export interface CreateDigestJobResponse {
  jobId: string
}

export interface Digest {
  url?: string
  title?: string
  content?: string
  chapters?: Chapter[]
  urlsToAudio?: string[]
  jobState: string

  speechFile: SpeechFile
}

interface Chapter {
  title: string
}

const digestKey = (userId: string) => `digest:${userId}`

export const getDigest = async (userId: string): Promise<Digest | null> => {
  await redisDataSource.redisClient?.set(
    digestKey(userId),
    JSON.stringify({
      id: 'BB3D5D89-70A2-4AE1-ADDC-713232B1281D',
      title:
        'SOTU response collapses, Trump hits new low, Biden fundraising explodes 3/11/24 TDPS Podcast',
      content: 'content',
      urlsToAudio: [],
      jobState: 'completed',
      speechFile: {
        pageId: '1234',
        wordCount: 2124,
        language: 'en-US',
        defaultVoice: 'en-US-ChristopherNeural',
        utterances: [
          {
            idx: '',
            text: 'TOP prospect JOINS Canucks - Team SPEAKS OUT on Demko Injury | Canucks News',
            wordOffset: 0,
            wordCount: 14,
            voice: 'en-US-ChristopherNeural',
          },
          {
            idx: '4',
            text: 'Intro',
            wordOffset: 14,
            wordCount: 1,
            voice: 'en-US-ChristopherNeural',
          },
        ],
      },
    })
  )

  const digest = await redisDataSource.redisClient?.get(digestKey(userId))
  return digest ? (JSON.parse(digest) as Digest) : null
}
