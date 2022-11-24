import axios from 'axios'

interface SearchResponse {
  data: {
    search: {
      edges: Edge[]
    }
  }
}

interface Edge {
  node: Node
}

interface Node {
  id: string
}

export const search = async (
  userId: string,
  apiEndpoint: string,
  auth: string,
  query: string
): Promise<Node[]> => {
  const requestData = JSON.stringify({
    query: `query Search($query: String) {
              search(query: $query) {
                ... on SearchSuccess {
                  edges {
                    node {
                      id
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
    if (edges.length == 0) {
      return []
    }

    return edges.map((edge: Edge) => edge.node)
  } catch (e) {
    console.error(e)

    return []
  }
}

export const isMatched = async (
  userId: string,
  apiEndpoint: string,
  auth: string,
  filter: string,
  pageId: string
): Promise<boolean> => {
  filter += ` includes:${pageId}`
  const nodes = await search(userId, apiEndpoint, auth, filter)

  return nodes.length > 0
}
