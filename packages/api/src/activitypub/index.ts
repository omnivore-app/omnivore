// https://firefish.social/api/admin/accounts/create

import axios, { AxiosInstance } from 'axios'
import { v4 as uuidv4 } from 'uuid'

export class FirefishClient {
  baseUrl: string
  adminToken: string
  encryptionToken: string
  axiosInstance: AxiosInstance

  constructor(baseUrl: string, adminToken: string, encryptionToken: string) {
    this.baseUrl = baseUrl
    this.adminToken = adminToken
    this.encryptionToken = encryptionToken
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    })
  }

  async getUserActor(username: string): Promise<string> {
    try {
      const response = await this.axiosInstance.post('/users/show', {
        username: username,
      })
      console.log('got user: ', response.data)
      return response.data
    } catch (error) {
      console.log('failed to create user', { error })
      throw new Error(`Failed to create user actor`)
    }
  }

  async createUserActor(
    id: string,
    name: string,
    username: string
  ): Promise<string> {
    try {
      const existing = this.getUserActor(username)

      const password = uuidv4()
      const response = await this.axiosInstance.post('/admin/accounts/create', {
        username: username,
        password: password,
      })
      console.log('create user response: ', response.data)
      return response.data['token']
    } catch (error) {
      console.log('failed to create user', { error })
      throw new Error(`Failed to create user actor`)
    }
  }

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
