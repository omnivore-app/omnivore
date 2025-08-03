interface WatcherEnv {
  imap: {
    host: string
    port: number
    auth: {
      user: string
      password: string
    }
  }
  omnivoreEmail: string
  apiKey: string
  apiEndpoint: string,
  waitTime: number
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

export function getEnv(): WatcherEnv {
  const parse = envParser(process.env)
  const imap = {
    auth: {
      user: parse('IMAP_USER')!,
      password: parse('IMAP_PASSWORD')!,
    },
    host: parse('IMAP_HOST')!,
    port: Number(parse('IMAP_PORT')!),
  }

  return {
    apiKey: parse('WATCHER_API_KEY')!,
    apiEndpoint: parse('WATCHER_API_ENDPOINT')!,
    omnivoreEmail: parse('OMNIVORE_EMAIL')!,
    waitTime: Number(parse('WAIT_TIME')),
    imap,
  }
}

export const env = getEnv()
