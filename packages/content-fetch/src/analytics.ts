import { PostHog } from 'posthog-node'

interface AnalyticEvent {
  distinctId: string
  event: string
  properties?: Record<string | number, any>
}

interface AnalyticClient {
  capture: (event: AnalyticEvent) => void
  shutdownAsync?: () => Promise<void>
}

class PostHogClient implements AnalyticClient {
  private client: PostHog

  constructor(apiKey: string) {
    this.client = new PostHog(apiKey)
  }

  capture({ distinctId, event, properties }: AnalyticEvent) {
    // get client from request context

    this.client.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        env: process.env.API_ENV || 'demo',
      },
    })
  }

  async shutdownAsync() {
    return this.client.shutdownAsync()
  }
}

export const analytics = new PostHogClient(
  process.env.POSTHOG_API_KEY || 'test'
)
