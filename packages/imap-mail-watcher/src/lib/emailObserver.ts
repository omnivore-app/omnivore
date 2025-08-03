import { Observable } from 'rxjs'
import { FetchMessageObject, ImapFlow, MailboxLockObject } from 'imapflow'
import { env } from '../env'

const client: ImapFlow = new ImapFlow({
  host: env.imap.host,
  port: env.imap.port,
  secure: true,
  auth: {
    user: env.imap.auth.user,
    pass: env.imap.auth.password,
  },
})

export const emailObserver$ = new Observable<FetchMessageObject>(
  (subscriber) => {
    let loop = true
    let lock: MailboxLockObject | null = null

    process.nextTick(async () => {
      while (loop) {
        if (!client.usable) {
          await client.connect()
        }

        if (!lock) {
          lock = await client.getMailboxLock('INBOX')
        }

        // Retrieve all the mails that have yet to be seen.
        const messages = await client.fetchAll(
          { seen: false },
          {
            envelope: true,
            source: true,
            uid: true,
          }
        )

        for (const message of messages) {
          subscriber.next(message)
          // Once we are done with this message, set it to seen.
          await client.messageFlagsSet(
            { uid: message.uid.toString(), seen: false },
            ['\\Seen']
          )
        }

        await new Promise((resolve) => setTimeout(resolve, env.waitTime))
      }
    })

    return () => {
      loop = false
      lock?.release()
    }
  }
)
