import { map, mergeMap, repeat, retry } from 'rxjs'
import { FetchMessageObject } from 'imapflow'
import { emailObserver$ } from './lib/emailObserver'
import { simpleParser } from 'mailparser'
import { convertToMailObject, sendToEmailApi } from './lib/emailApi'
import { env } from './env'

void (() => {
  emailObserver$
    .pipe(
      retry(),
      mergeMap((email: FetchMessageObject) =>
        simpleParser(email.source?.toString() ?? '')
      ),
      map(convertToMailObject),
      mergeMap(sendToEmailApi),
      repeat({ delay: env.waitTime })
    )
    .subscribe()
})()

