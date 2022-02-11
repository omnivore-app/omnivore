export type TwitterUser = {
  id: string
  name: string
  username: string
  avatarUrl: string
  verified: boolean
  url: string
}

export type TweetMedia = {
  id: string
  type: string
  url: string
}

export type Tweet = {
  id: string
  text: string
  likes: number
  replies: number
  createdAt: string
  url: string
  author: TwitterUser
  media: TweetMedia[]
}

export type GetTweetsResponse = {
  data: {
    id: string
    text: string
    public_metrics: {
      like_count: number
      reply_count: number
      retweet_count: number
    }
    created_at: string
    author_id: string
    attachments: {
      media_keys: string[]
    }
  }[]
  includes: {
    users: {
      id: string
      name: string
      username: string
      profile_image_url: string
      verified: boolean
      url: string
    }[]
    media: {
      media_key: string
      url: string
      type: 'photo' | 'video'
    }[]
  }
}
