import { PostHog } from 'posthog-node'

interface AnalyticEvent {
  result: 'success' | 'failure'
  properties?: Record<string | number, any>
}

interface AnalyticClient {
  capture: (userIds: string[], event: AnalyticEvent) => void
}

class PostHogClient implements AnalyticClient {
  private client: PostHog

  constructor(apiKey: string) {
    this.client = new PostHog(apiKey)
  }

  capture(userIds: string[], { properties, result }: AnalyticEvent) {
    if (process.env.SEND_ANALYTICS && result === 'failure') {
      userIds.forEach((userId) => {
        this.client.capture({
          distinctId: userId,
          event: `content_fetch_${result}`,
          properties: {
            ...properties,
            env: process.env.API_ENV,
          },
        })
      })

      return
    }

    console.log('analytics', { userIds, result, properties })
  }
}

export const analytics = new PostHogClient(
  process.env.POSTHOG_API_KEY || 'test'
)
