import {
  Client,
  Partials,
  GatewayIntentBits,
  Events,
  MessageReaction,
  User,
  Embed,
} from 'discord.js'
import { PubSub } from '@google-cloud/pubsub'
import { OmnivoreArticle } from './types/OmnivoreArticle'
import { slugify } from 'voca'

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
const VALID_USERS = new Set(['podginator'])
const TOPIC_NAME = 'discordCommunityArticles'

client.once(Events.ClientReady, () => {
  console.log('Ready!')
})

const createMessageFromEmbed = (embed: Embed): OmnivoreArticle => {
  return {
    slug: slugify(embed.url),
    title: embed.title,
    description: embed.description,
    image: embed.thumbnail.url,
    url: embed.url,
    authors: '',
    publishedAt: new Date(),
    site: embed.url,
    type: 'community',
  }
}

client.on(
  Events.MessageReactionAdd,
  async (props: MessageReaction, user: User) => {
    const emoji = props.emoji.name
    const message = props.message.partial
      ? await props.message.fetch(true)
      : props.message
    const embed = message.embeds[0]
    const userName = user.username

    if (emoji === '🦥' && VALID_USERS.has(userName) && embed) {
      await pubSubClient
        .topic(TOPIC_NAME)
        .publishMessage({ json: createMessageFromEmbed(embed) })
    }
  }
)

client.login(process.env.DISCORD_BOT_KEY)
