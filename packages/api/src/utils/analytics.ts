import { PostHog } from 'posthog-node'
import { env } from '../env'

export const analytics = new PostHog(env.posthog.apiKey || 'test')
