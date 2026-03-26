import { env } from '../env'

export const corsConfig = {
  credentials: true,
  origin: [
    'https://omnivore.work',
    'https://dev.omnivore.work',
    'https://demo.omnivore.work',
    'https://web-prod.omnivore.work',
    'https://web-dev.omnivore.work',
    'https://web-demo.omnivore.work',
    'http://localhost:3000',
    env.dev.isLocal && 'https://studio.apollographql.com',
    env.client.url,
    'lsp://logseq.io',
    'app://obsidian.md',
    'https://plugins.amplenote.com',
    'amplenote-handler://bundle',
    'capacitor://localhost',
    'http://localhost',
  ],
  maxAge: 86400,
}
