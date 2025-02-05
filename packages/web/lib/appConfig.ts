// Types
type AppEnvironment = 'prod' | 'dev' | 'demo' | 'local'

type BaseURLs = {
  webBaseURL: string
  serverBaseURL: string
}

type BaseURLRecords = Record<AppEnvironment, BaseURLs>

// Internal functions and properties
const baseURLRecords: BaseURLRecords = {
  prod: {
    webBaseURL: process.env.NEXT_PUBLIC_BASE_URL ?? '',
    serverBaseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? '',
  },
  dev: {
    webBaseURL: process.env.NEXT_PUBLIC_DEV_BASE_URL ?? '',
    serverBaseURL: process.env.NEXT_PUBLIC_DEV_SERVER_BASE_URL ?? '',
  },
  demo: {
    webBaseURL: process.env.NEXT_PUBLIC_DEMO_BASE_URL ?? '',
    serverBaseURL: process.env.NEXT_PUBLIC_DEMO_SERVER_BASE_URL ?? '',
  },
  local: {
    webBaseURL: process.env.NEXT_PUBLIC_LOCAL_BASE_URL ?? '',
    serverBaseURL: process.env.NEXT_PUBLIC_LOCAL_SERVER_BASE_URL ?? '',
  },
}

function serverBaseURL(env: AppEnvironment): string {
  const value = baseURLRecords[appEnv].serverBaseURL
  if (value.length == 0 && global.window) {
    const windowEnv = (window as any).omnivoreEnv
    console.warn(
      `Couldn't find environment variable for server base url in ${env} environment, using ${windowEnv.SERVER_BASE_URL}`
    )

    return windowEnv.SERVER_BASE_URL ?? ''
  }
  return value
}

function webURL(env: AppEnvironment): string {
  const value = baseURLRecords[appEnv].webBaseURL
  if (value.length == 0 && global.window) {
    const windowEnv = (window as any).omnivoreEnv
    console.warn(
      `Couldn't find environment variable for base url in ${env} environment, using ${windowEnv.BASE_URL}`
    )

    return windowEnv.BASE_URL ?? ''
  }
  return value
}

const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || 'prod') as AppEnvironment

// Exports
export const sentryDSN =
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

export const pspdfKitKey = process.env.NEXT_PUBLIC_PSPDFKIT_LICENSE_KEY

export const ssoJwtSecret = process.env.SSO_JWT_SECRET

export const gauthRedirectURI =
  appEnv == 'local'
    ? `${baseURLRecords[appEnv].serverBaseURL}/api/auth/gauth-redirect-localhost`
    : `${baseURLRecords[appEnv].serverBaseURL}/api/auth/vercel/gauth-redirect`

export const appleAuthRedirectURI =
  appEnv == 'local'
    ? `${baseURLRecords[appEnv].serverBaseURL}/api/auth/apple-redirect-localhost`
    : `${baseURLRecords[appEnv].serverBaseURL}/api/auth/vercel/apple-redirect`

export const intercomAppID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID

export const googleID =
  appEnv == 'prod'
    ? process.env.NEXT_PUBLIC_GOOGLE_ID
    : process.env.NEXT_PUBLIC_DEV_GOOGLE_ID

export const gqlEndpoint = `${serverBaseURL(appEnv)}/api/graphql`

export const fetchEndpoint = `${serverBaseURL(appEnv)}/api`

export const webBaseURL = webURL(appEnv)
