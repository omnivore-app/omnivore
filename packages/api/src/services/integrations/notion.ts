import { Client } from '@notionhq/client'
import axios from 'axios'
import { LibraryItem } from '../../entity/library_item'
import { env } from '../../env'
import { logger } from '../../utils/logger'
import { IntegrationClient } from './integration'

interface NotionPage {
  parent: {
    page_id: string
  }
  cover?: {
    external: {
      url: string
    }
  }
  properties: {
    title: Array<{
      text: {
        content: string
      }
    }>
  }
}

interface Settings {
  parentPageId: string
}

export class NotionClient implements IntegrationClient {
  name = 'NOTION'
  _headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Notion-Version': '2022-06-28',
  }
  _timeout = 5000 // 5 seconds
  _axios = axios.create({
    baseURL: 'https://api.notion.com/v1',
    timeout: this._timeout,
  })

  _token: string
  _client: Client
  _settings: Settings

  constructor(token: string, settings: Settings) {
    this._token = token
    this._client = new Client({
      auth: token,
      timeoutMs: this._timeout,
    })
    this._settings = settings
  }

  accessToken = async (): Promise<string | null> => {
    try {
      // encode in base 64
      const encoded = Buffer.from(
        `${env.notion.clientId}:${env.notion.clientSecret}`
      ).toString('base64')

      const response = await this._axios.post<{ access_token: string }>(
        '/oauth/token',
        {
          grant_type: 'authorization_code',
          code: this._token,
          redirect_uri: `${env.client.url}/settings/integrations`,
        },
        {
          headers: {
            ...this._headers,
            Authorization: `Basic ${encoded}`,
          },
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
        page_id: this._settings.parentPageId,
      },
      cover: item.thumbnail
        ? {
            external: {
              url: item.thumbnail,
            },
          }
        : undefined,
      properties: {
        title: [
          {
            text: {
              content: item.title,
            },
          },
        ],
      },
    }
  }

  _createPage = async (page: NotionPage) => {
    await this._client.pages.create(page)
  }

  export = async (items: LibraryItem[]): Promise<boolean> => {
    const pages = items.map(this._itemToNotionPage)
    await Promise.all(pages.map((page) => this._createPage(page)))

    return true
  }
}
