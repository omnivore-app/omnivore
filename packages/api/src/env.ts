import { getEnv } from './util'

export const env = getEnv(process.env)

export function homePageURL(): string {
  return env.client.url
}
