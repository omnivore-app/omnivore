import { env } from './env'
import * as Sentry from '@sentry/node'
import { CaptureConsole } from '@sentry/integrations'

export const sentryConfig = {
  dsn: env.sentry.dsn,
  environment: env.server.apiEnv,
  // Don't bother collecting and sending events locally (reduces overhead).
  enabled: !env.dev.isLocal,
  serverName: process.env.GAE_INSTANCE || '',
  integrations: [
    new Sentry.Integrations.OnUncaughtException(),
    new CaptureConsole({ levels: ['error'] }),
  ],
  debug: (env.dev.isLocal && process.env.DEBUG === 'true') || false,
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 0,
}
