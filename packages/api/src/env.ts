import { getEnv } from './util'

export const env = getEnv()

export function homePageURL(): string {
  if (env.client.url != '') {
    return env.client.url
  }

  switch (env.server.apiEnv) {
    case 'local':
      return 'http://localhost:3000'
    case 'demo':
      return 'https://demo.omnivore.app'
    case 'qa':
      return 'https://web-dev.omnivore.app'
    case 'prod':
      return 'https://omnivore.app'
  }

  return 'https://omnivore.app'
}
