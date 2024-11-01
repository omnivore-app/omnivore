import { EmailContents } from '../types/EmailContents'
import axios from 'axios'
import { env } from '../env'

export const sendToEmailApi = (data: EmailContents) => {
  return axios.post(env.apiEndpoint, data, {
    headers: {
      ['x-api-key']: env.apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 5000,
  })
}
