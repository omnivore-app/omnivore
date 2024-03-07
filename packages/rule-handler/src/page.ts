import axios from 'axios'

export const archivePage = async (
  apiEndpoint: string,
  auth: string,
  pageId: string
) => {
  const data = JSON.stringify({
    query: `mutation SetLinkArchived($input: ArchiveLinkInput!) {
              setLinkArchived(input: $input) {
                ... on ArchiveLinkSuccess {
                  linkId
                  message
                }
                ... on ArchiveLinkError {
                  message
                  errorCodes
                }
              }
            }`,
    variables: {
      input: {
        linkId: pageId,
        archived: true,
      },
    },
  })

  try {
    return await axios.post(`${apiEndpoint}/graphql`, data, {
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
  apiEndpoint: string,
  auth: string,
  pageId: string
) => {
  const data = JSON.stringify({
    query: `mutation SaveArticleReadingProgress($input: SaveArticleReadingProgressInput!) {
              saveArticleReadingProgress(input: $input) {
                ... on SaveArticleReadingProgressSuccess {
                  updatedArticle {
                    id
                  }
                }
                ... on SaveArticleReadingProgressError {
                  errorCodes
                }
              }
            }`,
    variables: {
      input: {
        id: pageId,
        readingProgressPercent: 100,
        readingProgressAnchorIndex: 0,
      },
    },
  })

  try {
    return await axios.post(`${apiEndpoint}/graphql`, data, {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    console.error(e)
  }
}
