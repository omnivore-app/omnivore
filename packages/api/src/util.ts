/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import os from 'os'
import * as dotenv from 'dotenv'

interface BackendEnv {
  pg: {
    host: string
    port: number
    userName: string
    password: string
    dbName: string
    pool: {
      max: number
    }
  }
  server: {
    jwtSecret: string
    ssoJwtSecret: string
    gateway_url: string
    apiEnv: string
    instanceId: string
  }
  client: {
    url: string
    previewGenerationServiceUrl: string
    previewImageWrapperId: string
  }
  google: {
    auth: {
      iosClientId: string
      clientId: string
      secret: string
    }
  }
  segment: {
    writeKey: string
  }
  intercom: {
    token: string
  }
  sentry: {
    dsn: string
  }
  jaeger: {
    host: string
  }
  imageProxy: {
    url: string
    secretKey: string
  }
  twitter: {
    token: string
  }
  dev: {
    isLocal: boolean
  }
  queue: {
    location: string
    name: string
    contentFetchUrl: string
    contentFetchGCFUrl: string
    reminderTaskHanderUrl: string
  }
  fileUpload: {
    gcsUploadBucket: string
    gcsUploadSAKeyFilePath: string
    gcsUploadPrivateBucket: string
  }
  elastic: {
    url: string
    username: string
    password: string
  }
  sender: {
    message: string
    feedback: string
    general: string
  }
}

/***
 * Checks if we are running on Google App Engine.
 * See https://cloud.google.com/appengine/docs/standard/nodejs/runtime#environment_variables
 */
export function isAppEngine(): boolean {
  return (
    process.env.GOOGLE_CLOUD_PROJECT !== undefined &&
    process.env.GAE_INSTANCE !== undefined &&
    process.env.GAE_SERVICE !== undefined &&
    process.env.GAE_VERSION !== undefined
  )
}

const nullableEnvVars = [
  'INTERCOM_TOKEN',
  'GAE_INSTANCE',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'JAEGER_HOST',
  'IMAGE_PROXY_URL',
  'IMAGE_PROXY_SECRET',
  'SAMPLE_METRICS_LOCALLY',
  'PUPPETEER_QUEUE_LOCATION',
  'PUPPETEER_QUEUE_NAME',
  'CONTENT_FETCH_URL',
  'CONTENT_FETCH_GCF_URL',
  'PREVIEW_IMAGE_WRAPPER_ID',
  'PREVIEW_GENERATION_SERVICE_URL',
  'GCS_UPLOAD_SA_KEY_FILE_PATH',
  'GAUTH_IOS_CLIENT_ID',
  'GAUTH_CLIENT_ID',
  'GAUTH_SECRET',
  'SEGMENT_WRITE_KEY',
  'TWITTER_BEARER_TOKEN',
  'ELASTIC_USERNAME',
  'ELASTIC_PASSWORD',
  'GCS_UPLOAD_PRIVATE_BUCKET',
  'SENDER_MESSAGE',
  'SENDER_FEEDBACK',
  'SENDER_GENERAL',
] // Allow some vars to be null/empty

/* If not in GAE and Prod/QA/Demo env (f.e. on localhost/dev env), allow following env vars to be null */
if (
  !isAppEngine() &&
  ['prod', 'qa', 'demo'].indexOf(process.env.API_ENV || '') === -1
) {
  nullableEnvVars.push(
    ...['GCS_UPLOAD_BUCKET', 'PREVIEW_GENERATION_SERVICE_URL']
  )
}

const envParser =
  (env: { [key: string]: string | undefined }) =>
  (varName: string): string => {
    const value = env[varName]
    if (typeof value === 'string' && value) {
      return value
    } else if (nullableEnvVars.includes(varName)) {
      return ''
    }
    throw new Error(
      `Missing ${varName} with a non-empty value in process environment`
    )
  }

export function getEnv(): BackendEnv {
  // Dotenv parses env file merging into proces.env which is then read into custom struct here.
  dotenv.config()

  const parse = envParser(process.env)
  const pg = {
    host: parse('PG_HOST'),
    port: parseInt(parse('PG_PORT'), 10),
    userName: parse('PG_USER'),
    password: parse('PG_PASSWORD'),
    dbName: parse('PG_DB'),
    pool: {
      max: parseInt(parse('PG_POOL_MAX'), 10),
    },
  }
  const server = {
    jwtSecret: parse('JWT_SECRET'),
    ssoJwtSecret: parse('SSO_JWT_SECRET'),
    gateway_url: parse('GATEWAY_URL'),
    apiEnv: parse('API_ENV'),
    instanceId:
      parse('GAE_INSTANCE') || `x${os.userInfo().username}_${os.hostname()}`,
  }
  const client = {
    url: parse('CLIENT_URL'),
    previewGenerationServiceUrl: parse('PREVIEW_GENERATION_SERVICE_URL'),
    previewImageWrapperId: parse('PREVIEW_IMAGE_WRAPPER_ID'),
  }
  const google = {
    auth: {
      iosClientId: parse('GAUTH_IOS_CLIENT_ID'),
      clientId: parse('GAUTH_CLIENT_ID'),
      secret: parse('GAUTH_SECRET'),
    },
  }
  const segment = {
    writeKey: parse('SEGMENT_WRITE_KEY'),
  }
  const intercom = {
    token: parse('INTERCOM_TOKEN'),
  }
  const sentry = {
    dsn: parse('SENTRY_DSN'),
  }
  const jaeger = {
    host: parse('JAEGER_HOST'),
  }
  const dev = {
    isLocal: !isAppEngine(),
  }
  const queue = {
    location: parse('PUPPETEER_QUEUE_LOCATION'),
    name: parse('PUPPETEER_QUEUE_NAME'),
    contentFetchUrl: parse('CONTENT_FETCH_URL'),
    contentFetchGCFUrl: parse('CONTENT_FETCH_GCF_URL'),
    reminderTaskHanderUrl: parse('REMINDER_TASK_HANDLER_URL'),
  }
  const imageProxy = {
    url: parse('IMAGE_PROXY_URL'),
    secretKey: parse('IMAGE_PROXY_SECRET'),
  }
  const twitter = {
    token: parse('TWITTER_BEARER_TOKEN'),
  }
  const fileUpload = {
    gcsUploadBucket: parse('GCS_UPLOAD_BUCKET'),
    gcsUploadSAKeyFilePath: parse('GCS_UPLOAD_SA_KEY_FILE_PATH'),
    gcsUploadPrivateBucket: parse('GCS_UPLOAD_PRIVATE_BUCKET'),
  }
  const elastic = {
    url: parse('ELASTIC_URL'),
    username: parse('ELASTIC_USERNAME'),
    password: parse('ELASTIC_PASSWORD'),
  }
  const sender = {
    message: parse('SENDER_MESSAGE'),
    feedback: parse('SENDER_FEEDBACK'),
    general: parse('SENDER_GENERAL'),
  }

  return {
    pg,
    client,
    server,
    google,
    segment,
    intercom,
    sentry,
    jaeger,
    imageProxy,
    twitter,
    dev,
    fileUpload,
    queue,
    elastic,
    sender,
  }
}

export type Merge<
  Target extends Record<string, any>,
  Part extends Record<string, any>
> = Omit<Target, keyof Part> & Part

/**
 * Make all properties in T optional
 * This is similar to TS's Partial type, but it also allows null
 */
export type Partialize<T> = {
  [P in keyof T]?: T[P] | null
}

export function exclude<A extends readonly any[], B extends readonly any[]>(
  a: A,
  b: B
): readonly Exclude<A[number], B[number]>[] {
  return a.filter((x) => b.includes(x)) as any
}

export type PickTuple<A, B extends readonly any[]> = Pick<A, B[number]>
