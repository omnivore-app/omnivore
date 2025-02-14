import axios from 'axios'
import { env } from '../env'
import { ParsedMail } from 'mailparser'
import { EmailContents } from '../types/EmailContents'

export const sendToEmailApi = (data: EmailContents) => {
  console.log(`Sending mail with subject: ${data.subject} to ${data.to}`)
  return axios.post(`${env.apiEndpoint}/mail`, data, {
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
    to: env.omnivoreEmail,
    subject: it.subject || '',
    html: it.html || '',
    text: it.text || '',
    headers: it.headers,
  }
}
