/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Client,
  Partials,
  GatewayIntentBits,
  Events,
  MessageReaction,
  User,
  Embed,
  PartialMessageReaction,
  PartialUser,
} from 'discord.js'
import { PubSub } from '@google-cloud/pubsub'
import { OmnivoreArticle } from './types/OmnivoreArticle'
import { slugify } from 'voca'
import * as dotenv from 'dotenv'

dotenv.config()

const client = new Client({
  partials: [Partials.Message, Partials.Reaction],
  intents: [
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
  ],
})

const pubSubClient = new PubSub()

// Will have missed people here
const VALID_USERS = new Set([
  'danielprindii',
  'riiku',
  'hongbowu',
  'mollydot',
  'jackson.harper',
  'podginator',
])
const TOPIC_NAME = 'discordCommunityArticles'

client.once(Events.ClientReady, () => {
  console.log('Ready!')
})

const createMessageFromEmbed = (embed: Embed): OmnivoreArticle | undefined => {
  if (!embed.url || !embed.title || !embed.description) {
    return undefined
  }
  return {
    slug: slugify(embed.url),
    title: embed.title,
    description: embed.description,
    image: embed.thumbnail?.url,
    url: embed.url,
    authors: embed.author?.name ?? new URL(embed.url).host,
    publishedAt: new Date(),
    site: embed.url,
    type: 'community',
  }
}

client.on(
  Events.MessageReactionAdd,
  async (
    props: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ): Promise<void> => {
    const emoji = props.emoji.name
    const message = props.message.partial
      ? await props.message.fetch(true)
      : props.message
    const embed = message.embeds[0]
    const userName = user.username

    if (emoji === '🦥' && userName && VALID_USERS.has(userName) && embed) {
      const jsonMessage = createMessageFromEmbed(embed)
      if (message) {
        await pubSubClient
          .topic(TOPIC_NAME)
          .publishMessage({ json: jsonMessage })
      }
    }
  }
)

client.login(process.env.DISCORD_BOT_KEY).catch((error) => {
  console.log('error logging in:', error)
})
