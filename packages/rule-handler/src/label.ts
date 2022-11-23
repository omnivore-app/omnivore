import axios from 'axios'
import { getAuthToken } from './index'

export const addLabels = async (
  userId: string,
  apiEndpoint: string,
  jwtSecret: string,
  pageId: string,
  labelIds: string[]
) => {
  const auth = await getAuthToken(userId, jwtSecret)

  const data = JSON.stringify({
    query: `mutation SetLabels($input: SetLabelsInput!) {
              setLabels(input: $input) {
                ... on SetLabelsSuccess {
                  labels {
                    id
                  }
                }
                ... on SetLabelsError {
                  errorCodes
                }
              }
            }`,
    variables: {
      input: {
        pageId,
        labelIds,
      },
    },
  })

  try {
    await axios.post(`${apiEndpoint}/graphql`, data, {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    console.error(e)
  }
}
