import { Integration } from '../../entity/integration'
import { Page } from '../../elastic/types'

export abstract class IntegrationService {
  abstract name: string

  validateToken = async (token: string): Promise<boolean> => {
    return Promise.resolve(true)
  }
  exportPages = async (
    integration: Integration,
    pages: Page[]
  ): Promise<boolean> => {
    return Promise.resolve(true)
  }
  importPages = async (
    integration: Integration,
    pages: Page[]
  ): Promise<boolean> => {
    return Promise.resolve(true)
  }
}
