import { Integration } from '../../entity/integration'
import { Page } from '../../elastic/types'

export abstract class IntegrationService {
  abstract name: string

  accessToken = async (token: string): Promise<string | null> => {
    return Promise.resolve('')
  }
  export = async (
    integration: Integration,
    pages: Page[]
  ): Promise<boolean> => {
    return Promise.resolve(true)
  }
  import = async (integration: Integration): Promise<number> => {
    return Promise.resolve(0)
  }
}
