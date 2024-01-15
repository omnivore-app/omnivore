import { BackendEnv, getEnv } from './util'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

// When running on GCP we want to use secrets manager instead
// of environment variables for storing secrets. This means
// after startup we need to query secret manager, and
// pull in those secrets.
// To opt into this feature you need to set the `GCP_SECRETS_NAME`
// environment variable to the secrets name for example:
// `omnivore-project/secrets/my-secrets/latest`
//
export const loadEnvFromGCPSecrets = async (): Promise<
  BackendEnv | undefined
> => {
  if (process.env.GCP_SECRETS_NAME && process.env.GCP_PROJECT_ID) {
    const client = new SecretManagerServiceClient()
    const [version] = await client.accessSecretVersion({
      name: `projects/${process.env.GCP_PROJECT_ID}/secrets/${process.env.GCP_SECRETS_NAME}/versions/latest`,
    })
    if (!version || !version.payload || !version.payload.data) {
      throw new Error(`no data for secret: ${process.env.GCP_SECRETS_NAME}`)
    }
    let data = Buffer.from(version.payload.data.toString(), 'base64')
    const result: any = JSON.parse(data.toString())
    return getEnv(result)
  }
  return undefined
}
