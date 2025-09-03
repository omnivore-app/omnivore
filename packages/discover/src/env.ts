import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + '/./../env' })

interface redisConfig {
  url?: string
  cert?: string
}

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
  openAiApiKey: string
  imageProxy: {
    url?: string
    secretKey?: string
  }
  redis: {
    mq: redisConfig
    cache: redisConfig
  }
}

const envParser =
  (env: { [key: string]: string | undefined }) =>
  (varName: string, throwOnUndefined = false): string | undefined => {
    const value = env[varName]
    if (typeof value === 'string' && value) {
      return value
    }

    if (throwOnUndefined) {
      throw new Error(
        `Missing ${varName} with a non-empty value in process environment`
      )
    }

    return
  }

export function getEnv(): BackendEnv {
  // Dotenv parses env file merging into proces.env which is then read into custom struct here.
  dotenv.config({ path: __dirname + '/./../.env' })
  const parse = envParser(process.env)
  const pg = {
    host: parse('PG_HOST')!,
    port: parseInt(parse('PG_PORT')!, 10),
    userName: parse('POSTGRES_USER')!,
    password: parse('POSTGRES_PASSWORD')!,
    dbName: parse('PG_DB')!,
    pool: {
      max: parseInt(parse('PG_POOL_MAX')!, 10),
    },
  }

  const redis = {
    mq: {
      url: parse('MQ_REDIS_URL'),
      cert: parse('MQ_REDIS_CERT')?.replace(/\\n/g, '\n'), // replace \n with new line
    },
    cache: {
      url: parse('REDIS_URL'),
      cert: parse('REDIS_CERT')?.replace(/\\n/g, '\n'), // replace \n with new line
    },
  }

  return {
    pg,
    openAiApiKey: parse('OPENAI_API_KEY')!,
    imageProxy: {
      url: parse('IMAGE_PROXY_URL', false),
      secretKey: parse('IMAGE_PROXY_SECRET', false),
    },
    redis
  }
}

export const env = getEnv()
