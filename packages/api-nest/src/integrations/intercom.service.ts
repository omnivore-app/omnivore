import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface IntercomContact {
  email: string
  external_id: string
  name: string
  avatar?: string
  custom_attributes?: Record<string, any>
  signed_up_at?: number
}

export interface IntercomClient {
  createContact(contact: IntercomContact): Promise<void>
  updateContact(
    externalId: string,
    updates: Partial<IntercomContact>,
  ): Promise<void>
}

@Injectable()
export class IntercomService implements IntercomClient {
  private readonly logger = new Logger(IntercomService.name)
  private readonly enabled: boolean
  private readonly apiKey?: string

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('INTERCOM_ENABLED', false)
    this.apiKey = this.configService.get<string>('INTERCOM_API_KEY')
  }

  async createContact(contact: IntercomContact): Promise<void> {
    if (!this.enabled || !this.apiKey) {
      this.logger.debug('Intercom integration disabled or not configured', {
        enabled: this.enabled,
        hasApiKey: !!this.apiKey,
        contact: {
          email: contact.email,
          external_id: contact.external_id,
          name: contact.name,
        },
      })
      return
    }

    try {
      // TODO: Integrate with actual Intercom API
      // For now, log structured contact creation events
      this.logger.log('Creating Intercom contact', {
        service: 'intercom',
        action: 'create_contact',
        contact: {
          email: contact.email,
          external_id: contact.external_id,
          name: contact.name,
          signed_up_at: contact.signed_up_at,
        },
        implementation: 'STUB - needs Intercom API integration',
      })

      // In production, this would be:
      // const intercomClient = new Client({ tokenAuth: { token: this.apiKey } })
      // await intercomClient.contacts.create(contact)
    } catch (error) {
      this.logger.error('Failed to create Intercom contact', {
        error,
        email: contact.email,
        external_id: contact.external_id,
      })
      // Don't throw - Intercom failures shouldn't block user operations
    }
  }

  async updateContact(
    externalId: string,
    updates: Partial<IntercomContact>,
  ): Promise<void> {
    if (!this.enabled || !this.apiKey) {
      this.logger.debug('Intercom integration disabled or not configured', {
        enabled: this.enabled,
        hasApiKey: !!this.apiKey,
        externalId,
        updates,
      })
      return
    }

    try {
      this.logger.log('Updating Intercom contact', {
        service: 'intercom',
        action: 'update_contact',
        external_id: externalId,
        updates,
        implementation: 'STUB - needs Intercom API integration',
      })

      // In production, this would be:
      // const intercomClient = new Client({ tokenAuth: { token: this.apiKey } })
      // await intercomClient.contacts.update({ id: externalId, ...updates })
    } catch (error) {
      this.logger.error('Failed to update Intercom contact', {
        error,
        external_id: externalId,
        updates,
      })
    }
  }

  /**
   * Create a contact for a newly registered user
   */
  async createUserContact(
    userId: string,
    email: string,
    name: string,
    username: string,
    pictureUrl?: string,
    sourceUserId?: string,
  ): Promise<void> {
    const contact: IntercomContact = {
      email,
      external_id: userId,
      name,
      avatar: pictureUrl,
      custom_attributes: {
        source_user_id: sourceUserId || userId,
        username,
      },
      signed_up_at: Math.floor(Date.now() / 1000),
    }

    await this.createContact(contact)
  }
}
