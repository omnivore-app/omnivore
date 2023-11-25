import axios from 'axios'

export const setLabels = async (
  apiEndpoint: string,
  auth: string,
  pageId: string,
  labelIds: string[],
) => {
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
    return axios.post(`${apiEndpoint}/graphql`, data, {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    console.error(e)
  }
}
