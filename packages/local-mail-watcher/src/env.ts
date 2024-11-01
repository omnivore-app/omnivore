interface redisConfig {
  url?: string
  cert?: string
}

interface WatcherEnv {
  filesystem: {
    filePath: string
  }
  redis: {
    mq: redisConfig
    cache: redisConfig
  }
  apiKey: string
  apiEndpoint: string
}

const envParser =
  (env: { [key: string]: string | undefined }) =>
  (varName: string, throwOnUndefined = true): string | undefined => {
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

export function getEnv(): WatcherEnv {
  const parse = envParser(process.env)
  const filesystem = {
    filePath: parse('MAIL_FILE_PATH')!,
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
    apiKey: parse('WATCHER_API_KEY')!,
    apiEndpoint: parse('WATCHER_API_ENDPOINT')!,
    filesystem,
    redis
  }
}

export const env = getEnv()
