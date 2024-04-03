import axios, { type AxiosResponse } from 'axios'
import {
  type Article,
  type SearchItemEdge,
  type ArticleSuccess,
  Label,
  LabelsSuccess,
} from '../../../types/OmnivoreSchema'

const API_URL =
  process.env.OMNIVORE_API_URL ?? 'https://api-prod.omnivore.app/api'

export class OmnivoreClient {
  username: string
  token: string

  private constructor(username: string, token: string) {
    this.username = username
    this.token = token
  }

  static async createOmnivoreClient(token: string): Promise<OmnivoreClient> {
    return new OmnivoreClient(await this.getUsername(token), token)
  }

  private static async getUsername(token: string): Promise<string> {
    const data = JSON.stringify({
      query: `query GetUsername {
          me {
            profile {
              username
            }
          }
        }
    `,
    })

    const response = await axios
      .post(`${API_URL}/graphql`, data, {
        headers: {
          Cookie: `auth=${token};`,
          'Content-Type': 'application/json',
        },
      })
      .catch((error) => {
        console.error(error)
        throw error
      })

    return response.data.data.me.profile.username as string
  }

  async fetchPages(): Promise<SearchItemEdge[]> {
    const data = {
      query: `query Search($after: String, $first: Int, $query: String) {
              search(first: $first, after: $after, query: $query) {
                ... on SearchSuccess {
                  edges {
                    cursor
                    node {
                      id
                      title
                      slug
                      url
                      pageType
                      contentReader
                      createdAt
                      isArchived
                      author
                      image
                      description
                      publishedAt
                      ownedByViewer
                      originalArticleUrl
                      uploadFileId
                      labels {
                        id
                        name
                        color
                      }
                      pageId
                      shortId
                      quote
                      annotation
                      state
                      siteName
                      subscription
                      readAt
                      savedAt
                      wordsCount
                    }
                  }
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                    totalCount
                  }
                }
                ... on SearchError {
                  errorCodes
                }
              }
            }`,
      variables: { query: 'in:inbox', after: '0', first: 1000 },
    }

    const response = await axios
      .post(`${API_URL}/graphql`, data, {
        headers: {
          Cookie: `auth=${process.env.OMNIVORE_AUTH_TOKEN!};`,
          'Content-Type': 'application/json',
        },
      })
      .catch((error) => {
        console.error(error)
        throw error
      })

    return response.data.data.search.edges as SearchItemEdge[]
  }

  async fetchPage(slug: string): Promise<Article> {
    const data = JSON.stringify({
      variables: {
        username: this.username,
        slug,
      },
      query: `query GetArticle(
          $username: String!
          $slug: String!
        ) {
          article(username: $username, slug: $slug) {
            ... on ArticleSuccess {
              article {
                id, 
                title,
                url,
                author, 
                savedAt,
                description,
                image
                content
              }
            }
            ... on ArticleError {
              errorCodes
            }
          }
        }
    `,
    })

    const response: AxiosResponse<{ data: { article: ArticleSuccess } }> =
      await axios.post(`${API_URL}/graphql`, data, {
        headers: {
          Cookie: `auth=${this.token};`,
          'Content-Type': 'application/json',
        },
      })

    return response.data.data.article.article
  }

  async getUsersTags(): Promise<Label[]> {
    const data = JSON.stringify({
      query: `query GetLabels{
          labels {
            ... on LabelsSuccess {
              labels {
                id, 
                name, 
                color,
                description,
                createdAt, 
                position, 
                internal
              }
            }
            ... on LabelsError {
              errorCodes
            }
          }
        }
    `,
    })

    const response: AxiosResponse<{ data: { labels: LabelsSuccess } }> =
      await axios.post(`${API_URL}/graphql`, data, {
        headers: {
          Cookie: `auth=${this.token};`,
          'Content-Type': 'application/json',
        },
      })

    return response.data.data.labels.labels
  }

  async archiveLink(id: string): Promise<boolean> {
    const mutation = `mutation ArchivePage($id: ID!) {
          setLinkArchived (input: {linkId: $id, archived: true}) {
              ... on ArchiveLinkSuccess {
                  linkId
                  message
              }
              ... on ArchiveLinkError {
                  message
                  errorCodes
              }
          }
      }`

    return await axios
      .post(
        `${API_URL}/graphql`,
        { query: mutation, variables: { id } },
        {
          headers: {
            Cookie: `auth=${this.token};`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((_) => true)
  }
}
