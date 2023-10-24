// https://firefish.social/api/admin/accounts/create

import axios, { AxiosInstance } from 'axios'
import { v4 as uuidv4 } from 'uuid'

const FIREFISH_APP_PERMISSIONS = [
  'read:account',
  'write:account',
  'read:blocks',
  'write:blocks',
  'read:drive',
  'write:drive',
  'read:favorites',
  'write:favorites',
  'read:following',
  'write:following',
  'read:messaging',
  'write:messaging',
  'read:mutes',
  'write:mutes',
  'write:notes',
  'read:notifications',
  'write:notifications',
  'read:reactions',
  'write:reactions',
  'write:votes',
  'read:pages',
  'write:pages',
  'write:page-likes',
  'read:page-likes',
  'read:user-groups',
  'write:user-groups',
  'read:channels',
  'write:channels',
  'read:gallery',
  'write:gallery',
  'read:gallery-likes',
  'write:gallery-likes',
]

export const createFirefishAdminClient = () => {
  return new FirefishClient(
    'http://localhost:8000/api',
    process.env.FIREFISH_TOKEN || 'firefish-token',
    'abc123'
  )
}

export const createFirefishUserClient = (token: string) => {
  return new FirefishActorClient('http://localhost:8000/api', token, 'abc123')
}

export class FirefishClient {
  baseUrl: string
  token: string
  encryptionToken: string
  axiosInstance: AxiosInstance

  constructor(baseUrl: string, token: string, encryptionToken: string) {
    this.baseUrl = baseUrl
    this.token = token
    this.encryptionToken = encryptionToken
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getUserInfo(): Promise<string | undefined> {
    try {
      const response = await this.axiosInstance.post('/i', {})
      console.log('getUserInfo got user: ', response.data)
      return response.data
    } catch (error) {
      console.log('error getUserInfo: ', error)

      return undefined
    }
  }

  async getUserActor(username: string): Promise<string | undefined> {
    try {
      const response = await this.axiosInstance.post('/users/show', {
        username: username,
      })
      console.log('got user: ', response.data)
      return response.data
    } catch (error) {
      return undefined
    }
  }

  async createUserActor(
    id: string,
    name: string,
    username: string
  ): Promise<string | undefined> {
    try {
      const existing = await this.getUserActor(username)
      console.log('existing user: ', existing)

      if (!existing) {
        const password = uuidv4()
        const response = await this.axiosInstance.post(
          '/admin/accounts/create',
          {
            username: username,
            password: password,
          }
        )
        console.log('create user response: ', response.data)
        const token = response.data['token']
        if (!token) {
          throw new Error('Unable to get user token')
        }
      }
      return undefined
    } catch (error) {
      console.log('failed to create user', { error })
      throw new Error(`Failed to create user actor`)
    }
  }

  // async createAppForActor(actorToken: string): Promise<string | undefined> {
  //   try {
  //     const response = await this.axiosInstance.post('/app/create', {
  //       name: 'Omnivore',
  //       description: 'Omnivore ActivityPub bridge',
  //       permission: FIREFISH_APP_PERMISSIONS,
  //     })
  //     console.log('create app response: ', response.data)
  //     return response.data['secret']
  //   } catch (error) {
  //     console.log('failed to create user', { error })
  //     throw new Error(`Failed to create user actor`)
  //   }
  // }

  // async createFeedActor(id, name): Promise<FeedActor> {
  //   try {
  //     const response = await this.axiosInstance.post('/feedActor', feed)
  //     return response.data
  //   } catch (error) {
  //     throw new Error(`Failed to create feed actor: ${error.message}`)
  //   }
  // }

  // async subscribeUserToFeed(subscription: Subscription): Promise<void> {
  //   try {
  //     await this.axiosInstance.post('/subscribe', subscription)
  //   } catch (error) {
  //     throw new Error(`Failed to subscribe user to feed: ${error.message}`)
  //   }
  // }
}

export class FirefishActorClient {
  baseUrl: string
  token: string
  encryptionToken: string
  axiosInstance: AxiosInstance

  constructor(baseUrl: string, token: string, encryptionToken: string) {
    this.baseUrl = baseUrl
    this.token = token
    this.encryptionToken = encryptionToken
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getUserInfo(): Promise<string | undefined> {
    try {
      const response = await this.axiosInstance.post('/i', {})
      console.log('getUserInfo got user: ', response.data)
      return response.data
    } catch (error) {
      console.log('error getUserInfo: ', error)

      return undefined
    }
  }

  // This will setup the user's profile and create an app for Omnivore
  // to connect with in the future
  async setupUserActor(id: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post('/i/update', {
        fields: [
          {
            name: 'omnivore-user-id',
            value: id,
          },
        ],
        isExplorable: false,
        hideOnlineStatus: true,
        publicReactions: false,
        preventAiLearning: true,
        ffVisibility: 'private',
        autoAcceptFollowed: false,
      })
      console.log('setupUserActor response: ', response.data)
      return true
    } catch (error) {
      console.log('failed to create user', { error })
      throw new Error(`Failed to create user actor`)
    }
  }

  // async createAppForActor(actorToken: string): Promise<string | undefined> {
  //   try {
  //     const response = await this.axiosInstance.post('/app/create', {
  //       name: 'Omnivore',
  //       description: 'Omnivore ActivityPub bridge',
  //       permission: FIREFISH_APP_PERMISSIONS,
  //     })
  //     console.log('create app response: ', response.data)
  //     return response.data['secret']
  //   } catch (error) {
  //     console.log('failed to create user', { error })
  //     throw new Error(`Failed to create user actor`)
  //   }
  // }

  // async createFeedActor(id, name): Promise<FeedActor> {
  //   try {
  //     const response = await this.axiosInstance.post('/feedActor', feed)
  //     return response.data
  //   } catch (error) {
  //     throw new Error(`Failed to create feed actor: ${error.message}`)
  //   }
  // }

  // async subscribeUserToFeed(subscription: Subscription): Promise<void> {
  //   try {
  //     await this.axiosInstance.post('/subscribe', subscription)
  //   } catch (error) {
  //     throw new Error(`Failed to subscribe user to feed: ${error.message}`)
  //   }
  // }
}
