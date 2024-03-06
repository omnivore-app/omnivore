import { Client } from '@notionhq/client'
import axios from 'axios'
import { updateIntegration } from '.'
import { Integration } from '../../entity/integration'
import { LibraryItem } from '../../entity/library_item'
import { env } from '../../env'
import { Merge } from '../../util'
import { logger } from '../../utils/logger'
import { IntegrationClient } from './integration'

type AnnotationColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'green_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background'

interface NotionPage {
  parent: {
    database_id: string
  }
  cover?: {
    external: {
      url: string
    }
  }
  icon?: {
    external: {
      url: string
    }
  }
  properties: {
    Title: {
      title: [
        {
          text: {
            content: string
          }
        }
      ]
    }
    'Original URL': {
      url: string | null
    }
    'Omnivore URL': {
      url: string | null
    }
    Tags?: {
      multi_select: Array<{ name: string }>
    }
  }
  children?: Array<{
    type: 'paragraph'
    paragraph: {
      rich_text: Array<{
        text: {
          content: string
          link?: { url: string }
        }
        annotations?: {
          bold?: boolean
          italic?: boolean
          strikethrough?: boolean
          underline?: boolean
          code?: boolean
          color?: AnnotationColor
        }
      }>
    }
  }>
}

interface Settings {
  parentPageId: string
  parentDatabaseId: string
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
  _integrationData?: Merge<Integration, { settings?: Settings }>

  constructor(token: string, integration?: Integration) {
    this._token = token
    this._client = new Client({
      auth: token,
      timeoutMs: this._timeout,
    })
    this._integrationData = integration
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
    const databaseId = this._integrationData?.settings?.parentDatabaseId
    if (!databaseId) {
      throw new Error('Notion database id not found')
    }

    return {
      parent: {
        database_id: databaseId,
      },
      icon: item.siteIcon
        ? {
            external: {
              url: item.siteIcon,
            },
          }
        : undefined,
      cover: item.thumbnail
        ? {
            external: {
              url: item.thumbnail,
            },
          }
        : undefined,
      properties: {
        Title: {
          title: [
            {
              text: {
                content: item.title,
              },
            },
          ],
        },
        'Original URL': {
          url: item.originalUrl,
        },
        'Omnivore URL': {
          url: `${env.client.url}/me/${item.slug}`,
        },
        Tags: item.labels
          ? { multi_select: item.labels.map((label) => ({ name: label.name })) }
          : undefined,
      },
      children: item.highlights
        ? item.highlights.map((highlight) => ({
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  text: {
                    content: highlight.quote || '',
                  },
                  annotations: {
                    color: highlight.color as AnnotationColor,
                  },
                },
                {
                  text: {
                    content: highlight.annotation || '',
                  },
                  annotations: {
                    italic: true,
                  },
                },
              ],
            },
          }))
        : undefined,
    }
  }

  _createPage = async (page: NotionPage) => {
    await this._client.pages.create(page)
  }

  export = async (items: LibraryItem[]): Promise<boolean> => {
    if (!this._integrationData || !this._integrationData.settings) {
      logger.error('Notion integration data not found')
      return false
    }

    const pageId = this._integrationData.settings.parentPageId
    if (!pageId) {
      logger.error('Notion parent page id not found')
      return false
    }

    const databaseId = this._integrationData.settings.parentDatabaseId
    if (!databaseId) {
      // create a database for the items
      const database = await this._client.databases.create({
        parent: {
          page_id: pageId,
        },
        title: [
          {
            text: {
              content: 'Library',
            },
          },
        ],
        description: [
          {
            text: {
              content: 'Library of saved items from Omnivore',
            },
          },
        ],
        properties: {
          Title: {
            title: {},
          },
          'Original URL': {
            url: {},
          },
          'Omnivore URL': {
            url: {},
          },
          Tags: {
            multi_select: {},
          },
        },
      })

      // save the database id
      this._integrationData.settings.parentDatabaseId = database.id
      await updateIntegration(
        this._integrationData.id,
        {
          settings: this._integrationData.settings,
        },
        this._integrationData.user.id
      )
    }

    const pages = items.map(this._itemToNotionPage)
    await Promise.all(pages.map((page) => this._createPage(page)))

    return true
  }
}
