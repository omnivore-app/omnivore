import httpContext from 'express-http-context2'
import { PostHog } from 'posthog-node'
import { env } from '../env'

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
    // // get client from request context
    // const client = httpContext.get<string>('client') || 'other'
    // this.client.capture({
    //   distinctId,
    //   event,
    //   properties: {
    //     ...properties,
    //     client,
    //     env: env.server.apiEnv,
    //   },
    // })
  }

  async shutdownAsync() {
    return this.client.shutdownAsync()
  }
}

export const analytics = new PostHogClient(env.posthog.apiKey || 'test')
