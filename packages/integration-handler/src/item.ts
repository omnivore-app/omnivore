import axios from 'axios'

interface SearchResponse {
  data: {
    search: {
      edges: Edge[]
      pageInfo: {
        hasNextPage: boolean
        endCursor: string
      }
    }
  }
  errors?: {
    message: string
  }[]
}

interface Edge {
  node: Item
}

export interface Item {
  id: string
  title: string
  image: string | null
  author: string | null
  siteName: string | null
  highlights: Highlight[]
  slug: string
  url: string
  updatedAt: Date
}

interface Highlight {
  id: string
  quote: string
  annotation: string | null
  type: string
  createdAt: string
}

export const search = async (
  apiEndpoint: string,
  token: string,
  highlightOnly: boolean,
  updatedSince: Date,
  first = '50',
  after = '0',
): Promise<SearchResponse | null> => {
  const query = `updated:${updatedSince.toISOString()} ${
    highlightOnly ? 'has:highlights' : ''
  } sort:updated-asc`

  const requestData = JSON.stringify({
    query: `query Search($query: String) {
              search(query: $query) {
                ... on SearchSuccess {
                  edges {
                    node {
                      id
                      slug
                      url
                      updatedAt
                      title
                      image
                      author
                      siteName
                      highlights {
                        id
                        quote
                        annotation
                        type
                        createdAt
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
                ... on SearchError {
                  errorCodes
                }
              }
            }`,
    variables: {
      query,
      first,
      after,
    },
  })

  try {
    const response = await axios.post<SearchResponse>(
      `${apiEndpoint}/graphql`,
      requestData,
      {
        headers: {
          Cookie: `auth=${token};`,
          'Content-Type': 'application/json',
          'X-OmnivoreClient': 'integration-handler',
        },
      },
    )

    return response.data
  } catch (error) {
    console.error(error)
    return null
  }
}

export const highlightUrl = (slug: string, highlightId: string): string =>
  `https://omnivore.app/me/${slug}#${highlightId}`
