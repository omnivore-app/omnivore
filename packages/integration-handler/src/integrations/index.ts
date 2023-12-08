import axios from 'axios'
import { IntegrationClient } from './integration'
import { PocketClient } from './pocket'
import { ReadwiseClient } from './readwise'

interface SetIntegrationResponse {
  data: {
    setIntegration: {
      integration: {
        id: string
      }
      errorCodes: string[]
    }
  }
}

const clients: IntegrationClient[] = [new ReadwiseClient(), new PocketClient()]

export const getIntegrationClient = (name: string): IntegrationClient => {
  const client = clients.find((s) => s.name === name)
  if (!client) {
    throw new Error(`Integration client not found: ${name}`)
  }
  return client
}

export const updateIntegration = async (
  apiEndpoint: string,
  id: string,
  syncedAt: Date,
  name: string,
  integrationToken: string,
  token: string,
  type: string,
  taskName?: string | null
): Promise<boolean> => {
  const requestData = JSON.stringify({
    query: `
      mutation SetIntegration($input: SetIntegrationInput!) {
        setIntegration(input: $input) {
          ... on SetIntegrationSuccess {
            integration {
              id
              enabled
            }
          }
          ... on SetIntegrationError {
            errorCodes
          }
        }
      }`,
    variables: {
      input: {
        id,
        syncedAt,
        name,
        token: integrationToken,
        enabled: true,
        type,
        // taskName, // TODO: remove this
      },
    },
  })

  try {
    const response = await axios.post<SetIntegrationResponse>(
      `${apiEndpoint}/graphql`,
      requestData,
      {
        headers: {
          Cookie: `auth=${token};`,
          'Content-Type': 'application/json',
          'X-OmnivoreClient': 'integration-handler',
        },
      }
    )

    if (response.data.data.setIntegration.errorCodes) {
      console.error(response.data.data.setIntegration.errorCodes)
      return false
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
