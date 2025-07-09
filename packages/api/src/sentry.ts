import { env } from './env'
// Sentry integrations are loaded dynamically in server startup to avoid require() errors

export const sentryConfig = {
  dsn: env.sentry.dsn,
  environment: env.server.apiEnv,
  // Don't bother collecting and sending events locally (reduces overhead).
  enabled: !env.dev.isLocal,
  serverName: process.env.GAE_INSTANCE || '',
  debug: (env.dev.isLocal && process.env.DEBUG === 'true') || false,
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 0,
}
