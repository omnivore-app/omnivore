/* eslint-disable @typescript-eslint/restrict-plus-operands */
import axios from 'axios'
import sanitizeHtml from 'sanitize-html'
import { GetTweetsResponse, Tweet, TweetMedia, TwitterUser } from './types'
import { env } from '../../env'

function formatDate(timestamp: string): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const d = new Date(timestamp)
  return (
    (d.getHours() % 12 || 12) +
    ':' +
    String('00' + d.getMinutes()).slice(-2) +
    ' ' +
    (d.getHours() < 12 ? 'AM' : 'PM') +
    ' - ' +
    d.getDate() +
    ' ' +
    months[d.getMonth()] +
    ' ' +
    d.getFullYear()
  )
}

function extractTweetUrl(tweetText: string): string | undefined {
  const regex = /https?:\/\/t\.co\/.*$/
  const result = regex.exec(tweetText)
  return result?.[0]
}

export async function getTweets(ids: string[]): Promise<Map<string, Tweet>> {
  const result = new Map<string, Tweet>()
  if (!env.twitter.token) {
    return result
  }

  const response = await axios.get<GetTweetsResponse>(
    'https://api.twitter.com/2/tweets',
    {
      headers: {
        Authorization: `Bearer ${env.twitter.token}`,
      },
      params: {
        ids: ids.join(','),
        expansions: 'author_id,attachments.media_keys,attachments.poll_ids',
        'tweet.fields': 'created_at,attachments,public_metrics',
        'user.fields': 'created_at,url,verified,profile_image_url',
        'media.fields': 'url',
      },
    }
  )

  const authors = new Map<string, TwitterUser>()
  response.data.includes.users.forEach((user) => {
    authors.set(user.id, {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.profile_image_url,
      verified: user.verified,
      url: user.url,
    })
  })

  const media = new Map<string, TweetMedia>()
  response.data.includes.media.forEach((item) => {
    media.set(item.media_key, {
      id: item.media_key,
      url: item.url,
      type: item.type,
    })
  })

  response.data.data.forEach((tweet) => {
    result.set(tweet.id, {
      id: tweet.id,
      text: tweet.text.replace(/https?:\/\/t\.co\/.*$/, ''),
      likes: tweet.public_metrics.like_count,
      replies:
        tweet.public_metrics.reply_count + tweet.public_metrics.retweet_count,
      createdAt: tweet.created_at,
      author: authors.get(tweet.author_id) as TwitterUser,
      media:
        tweet?.attachments?.media_keys.map(
          (id) => media.get(id) as TweetMedia
        ) || [],
      url: extractTweetUrl(tweet.text) || '',
    })
  })

  return result
}

export function createTweetHtml(tweet: Tweet, template: string): string {
  return sanitizeHtml(
    template
      .replace(/%AUTHOR_URL%/g, tweet.author.url)
      .replace(/%AUTHOR_AVATAR_URL%/g, tweet.author.avatarUrl)
      .replace(/%AUTHOR_NAME%/g, tweet.author.name)
      .replace(/%AUTHOR_USERNAME%/g, tweet.author.username)
      .replace(/%TWEET_ID%/g, tweet.id)
      .replace(/%TWEET_TEXT%/g, tweet.text)
      .replace(/%TWEET_DATE%/g, formatDate(tweet.createdAt))
      .replace(/%TWEET_LIKES%/g, `${tweet.likes}`)
      .replace(/%TWEET_REPLIES%/g, `${tweet.replies}`)
      .replace(/%TWEET_URL%/g, tweet.url),
    {
      allowedTags: ['a', 'div', 'img', 'svg', 'g', 'circle', 'path', 'link'],
      allowedAttributes: false,
    }
  )
}
