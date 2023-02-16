import { ReadwiseIntegration } from './readwise'
import { IntegrationService } from './integration'
import { PocketIntegration } from './pocket'

const integrations: IntegrationService[] = [
  new ReadwiseIntegration(),
  new PocketIntegration(),
]

export const getIntegrationService = (name: string): IntegrationService => {
  const service = integrations.find((s) => s.name === name)
  if (!service) {
    throw new Error(`Integration service not found: ${name}`)
  }
  return service
}
