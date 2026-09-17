import { Observable } from 'rxjs'
import { FetchMessageObject, ImapFlow, MailboxLockObject } from 'imapflow'
import { env } from '../env'

const createClient = () => {
  const flow: any = new ImapFlow({
    host: env.imap.host,
    port: env.imap.port,
    secure: true,
    auth: {
      user: env.imap.auth.user,
      pass: env.imap.auth.password,
    },
  });

  flow._socketError = () => console.error('Socket error called. Ignoring... ');

  return flow;
}

export const emailObserver$ = new Observable<FetchMessageObject>(
  (subscriber) => {
    process.nextTick(async () => {
        const client = createClient()
        console.log('Connecting to IMAP server.')
        if (!client.usable) {
          await client.connect()
        }
	
	let lock: MailboxLockObject | null = null
        try {
          lock = await client.getMailboxLock('INBOX')
          // Retrieve all the mails that have yet to be seen.
          console.log('Fetching messages.')
          const messages = await client.fetchAll(
            { seen: false },
            {
              envelope: true,
              source: true,
              uid: true,
            }
          )


          console.log('Sending messages to subscriber.')
          for (const message of messages) {
            subscriber.next(message)
            // Once we are done with this message, set it to seen.
            await client.messageFlagsSet(
              { uid: message.uid.toString(), seen: false },
              ['\\Seen']
            )
          }

        } finally {
          console.log('Releasing lock and logging out.')
          lock?.release()
	  await client.logout()
	  client.close()
          subscriber.complete()
        }
    })
    return () => {}
  }
)


