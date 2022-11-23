import { getAuthToken } from './index'
import axios from 'axios'

export const archivePage = async (
  pageId: string,
  userId: string,
  apiEndpoint: string,
  jwtSecret: string
) => {
  const auth = await getAuthToken(userId, jwtSecret)

  const data = JSON.stringify({
    query: `mutation ArchivePage($input: ArchivePageInput!) {
              archivePage(input: $input) {
                ... on ArchivePageSuccess {
                  page {
                    id
                  }
                }
                ... on ArchivePageError {
                  errorCodes
                }
              }
            }`,
    variables: {
      input: {
        pageId,
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

export const markPageAsRead = async (
  pageId: string,
  userId: string,
  apiEndpoint: string,
  jwtSecret: string
) => {
  const auth = await getAuthToken(userId, jwtSecret)

  const data = JSON.stringify({
    query: `mutation MarkPageAsRead($input: MarkPageAsReadInput!) {
              markPageAsRead(input: $input) {
                ... on MarkPageAsReadSuccess {
                  page {
                    id
                  }
                }
                ... on MarkPageAsReadError {
                  errorCodes
                }
              }
            }`,
    variables: {
      input: {
        pageId,
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
