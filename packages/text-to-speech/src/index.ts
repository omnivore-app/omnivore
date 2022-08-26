/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Sentry from '@sentry/serverless'
import parseHeaders from 'parse-headers'

export const textToSpeechHandler = Sentry.GCPFunction.wrapHttpFunction(
  async (req, res) => {
    console.log('new request', req)
      res.send('OK')
  }
)
