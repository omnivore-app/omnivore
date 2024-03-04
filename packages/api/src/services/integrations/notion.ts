import axios from 'axios'
import { LibraryItem } from '../../entity/library_item'
import { env } from '../../env'
import { logger } from '../../utils/logger'
import { IntegrationClient } from './integration'

interface NotionPage {
  parent: {
    database_id: string
  }
  cover?: {
    external: {
      url: string
    }
  }
  properties: {
    Name: {
      title: Array<{
        text: {
          content: string
        }
      }>
    }
    URL: {
      url: string
    }
    Tags: {
      multi_select: Array<{
        name: string
      }>
    }
  }
}

export class NotionClient implements IntegrationClient {
  name = 'NOTION'
  apiUrl = 'https://api.notion.com/v1'
  headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Notion-Version': '2022-06-28',
  }
  timeout = 5000 // 5 seconds

  accessToken = async (code: string): Promise<string | null> => {
    const authUrl = `${this.apiUrl}/oauth/token`
    try {
      // encode in base 64
      const encoded = Buffer.from(
        `${env.notion.clientId}:${env.notion.clientSecret}`
      ).toString('base64')

      const response = await axios.post<{ access_token: string }>(
        authUrl,
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${env.client.url}/settings/integrations`,
        },
        {
          headers: {
            authorization: `Basic ${encoded}`,
            ...this.headers,
          },
          timeout: this.timeout,
        }
      )
      return response.data.access_token
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(error.response)
      } else {
        logger.error(error)
      }
      return null
    }
  }

  async auth(): Promise<string> {
    return Promise.resolve(env.notion.authUrl)
  }

  private _itemToNotionPage = (item: LibraryItem): NotionPage => {
    return {
      parent: {
        database_id: item.id,
      },
      cover: item.thumbnail
        ? {
            external: {
              url: item.thumbnail,
            },
          }
        : undefined,
      properties: {
        Name: {
          title: [
            {
              text: {
                content: item.title,
              },
            },
          ],
        },
        URL: {
          url: item.originalUrl,
        },
        Tags: {
          multi_select:
            item.labels?.map((label) => {
              return {
                name: label.name,
              }
            }) || [],
        },
      },
    }
  }

  export = async (token: string, items: LibraryItem[]): Promise<boolean> => {
    const url = `${this.apiUrl}/pages`
    const page = this._itemToNotionPage(items[0])
    try {
      const response = await axios.post(url, page, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...this.headers,
        },
        timeout: this.timeout,
      })
      return response.status === 200
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(error.response)
      } else {
        logger.error(error)
      }
      return false
    }
  }
}
