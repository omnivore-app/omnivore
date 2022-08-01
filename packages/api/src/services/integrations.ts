import { IntegrationType } from '../generated/graphql'
import { env } from '../env'
import axios from 'axios'

const READWISE_API_URL = 'https://readwise.io/api/v2'

export const validateToken = async (
  token: string,
  type: IntegrationType
): Promise<boolean> => {
  switch (type) {
    case IntegrationType.Readwise:
      return validateReadwiseToken(token)
    default:
      return false
  }
}

const validateReadwiseToken = async (token: string): Promise<boolean> => {
  const authUrl = `${env.readwise.apiUrl || READWISE_API_URL}/auth`
  const response = await axios.get(authUrl, {
    headers: {
      Authorization: `Token ${token}`,
    },
  })
  return response.status === 204
}
