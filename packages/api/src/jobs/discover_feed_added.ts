import { DiscoverFeed } from '../generated/graphql'

export interface DiscoverFeedAddedJobData {
  id: string
  feed: DiscoverFeed
}

export const DISCOVER_FEED_ADDED_NAME = 'discover-feed-added'
