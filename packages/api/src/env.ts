import { getEnv } from './util'

export const env = getEnv()

export function homePageURL(): string {
  return env.client.url
}
