import * as intercom from 'intercom-client'
import { env } from '../env'

export const IntercomClient =
  env.server.apiEnv && !env.dev.isLocal
    ? new intercom.IntercomClient({
        token: env.intercom.token,
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
    event_name: eventName,
    user_id: userId,
    created_at: Math.floor(Date.now() / 1000), // this is mandatory for events
  })
}
