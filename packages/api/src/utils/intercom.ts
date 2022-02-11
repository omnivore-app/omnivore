import * as Intercom from 'intercom-client'
import { env } from '../env'

export const IntercomClient =
  env.server.apiEnv && !env.dev.isLocal
    ? new Intercom.Client({
        token: env.intercom.token,
      })
    : null

IntercomClient?.useRequestOpts({
  headers: {
    'Intercom-Version': 1.4,
  },
})

export function createIntercomEvent(
  eventName: string,
  userId: string,
  callback?: () => void
): void {
  if (!callback) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback = () => {}
  }
  if (!IntercomClient) return callback()
  IntercomClient.events.create(
    {
      event_name: eventName,
      user_id: userId,
      created_at: Math.floor(Date.now() / 1000), // this is mandatory for events
    },
    callback
  )
}
