import { EmailContents } from '../types/EmailContents'
import axios from 'axios'
import { env } from '../env'
import { ParsedMail } from 'mailparser'

export const sendToEmailApi = (data: EmailContents) => {
  return axios.post(env.apiEndpoint, data, {
    headers: {
      ['x-api-key']: env.apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 5000,
  })
}

export const convertToMailObject = (it: ParsedMail): EmailContents => {
  return {
    from: it.from?.value[0]?.address || '',
    to: (Array.isArray(it.to) ? it.to[0].text : it.to?.text) || '',
    subject: it.subject || '',
    html: it.html || '',
    text: it.text || '',
    headers: it.headers,
  }
}
