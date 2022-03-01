import { Client } from 'intercom-client'
import { env } from '../env'

export const IntercomClient =
  env.server.apiEnv && !env.dev.isLocal
    ? new Client({
        tokenAuth: { token: env.intercom.token },
      })
    : null

export async function createIntercomEvent(
  eventName: string,
  userId: string
): Promise<void> {
  if (!IntercomClient) {
    return
  }
  return IntercomClient.events.create({
    eventName: eventName,
    userId: userId,
    createdAt: Math.floor(Date.now() / 1000), // this is mandatory for events
  })
}
