import axios from 'axios'

interface SearchResponse {
  data: {
    search: {
      edges: Edge[]
    }
  }
}

interface Edge {
  node: Page
}

interface Page {
  id: string
  labels?: Label[] // labels is optional in the API response
  isArchived: boolean
  readingProgressPercent: number
}

interface Label {
  id: string
}

export const search = async (
  userId: string,
  apiEndpoint: string,
  auth: string,
  query: string
): Promise<Page[]> => {
  const requestData = JSON.stringify({
    query: `query Search($query: String) {
              search(query: $query) {
                ... on SearchSuccess {
                  edges {
                    node {
                      id
                      labels {
                        id
                      }
                      isArchived
                      readingProgressPercent      
                    }
                  }
                }
                ... on SearchError {
                  errorCodes
                }
              }
            }`,
    variables: {
      query,
    },
  })

  try {
    const response = await axios.post<SearchResponse>(
      `${apiEndpoint}/graphql`,
      requestData,
      {
        headers: {
          Cookie: `auth=${auth};`,
          'Content-Type': 'application/json',
        },
      }
    )

    const edges = response.data.data.search.edges
    if (edges.length === 0) {
      return []
    }

    return edges.map((edge: Edge) => edge.node)
  } catch (e) {
    console.error(e)

    return []
  }
}

export const filterPage = async (
  userId: string,
  apiEndpoint: string,
  auth: string,
  filter: string,
  pageId: string
): Promise<Page | null> => {
  filter += ` includes:${pageId}`
  const pages = await search(userId, apiEndpoint, auth, filter)

  return pages.length > 0 ? pages[0] : null
}
