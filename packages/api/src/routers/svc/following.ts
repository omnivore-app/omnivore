/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import {
  ArticleSavingRequestStatus,
  PageType,
  PreparedDocumentInput,
} from '../../generated/graphql'
import { createAndSaveLabelsInLibraryItem } from '../../services/labels'
import { createOrUpdateLibraryItem } from '../../services/library_item'
import { parsedContentToLibraryItem } from '../../services/save_page'
import { cleanUrl, generateSlug } from '../../utils/helpers'
import { createThumbnailProxyUrl } from '../../utils/imageproxy'
import { logger } from '../../utils/logger'
import {
  ParsedContentPuppeteer,
  parsePreparedContent,
} from '../../utils/parser'

type SourceOfFollowing = 'feed' | 'newsletter' | 'user'

export interface SaveFollowingItemRequest {
  userIds: string[]
  title: string
  url: string
  itemId?: string
  addedToFollowingBy: string
  addedToFollowingFrom: SourceOfFollowing
  author?: string
  description?: string
  links?: any
  feedContent?: string
  previewContentType?: string
  publishedAt?: Date
  savedAt?: Date
  thumbnail?: string
}

function isSaveFollowingItemRequest(
  body: any
): body is SaveFollowingItemRequest {
  return (
    'userIds' in body &&
    'addedToFollowingBy' in body &&
    'addedToFollowingFrom' in body &&
    'url' in body &&
    'title' in body
  )
}

const FOLDER = 'following'

export function followingServiceRouter() {
  const router = express.Router()

  router.post('/save', async (req, res) => {
    if (req.query.token !== process.env.PUBSUB_VERIFICATION_TOKEN) {
      logger.info('query does not include valid token')
      return res.sendStatus(403)
    }

    if (!isSaveFollowingItemRequest(req.body)) {
      logger.error('Invalid request body', req.body)
      return res.status(400).send('INVALID_REQUEST_BODY')
    }

    if (
      req.body.addedToFollowingFrom === 'feed' &&
      req.body.userIds.length > 0
    ) {
      const userId = req.body.userIds[0]
      logger.info('saving feed item', userId)

      const feedUrl = req.body.addedToFollowingBy
      const thumbnail =
        req.body.thumbnail && createThumbnailProxyUrl(req.body.thumbnail)
      const url = cleanUrl(req.body.url)

      const preparedDocument: PreparedDocumentInput = {
        document: req.body.feedContent || '',
        pageInfo: {
          title: req.body.title,
          author: req.body.author,
          canonicalUrl: url,
          contentType: req.body.previewContentType,
          description: req.body.description,
          previewImage: thumbnail,
        },
      }
      let parsedResult: ParsedContentPuppeteer | undefined

      // parse the content if we have a preview content
      if (req.body.feedContent) {
        parsedResult = await parsePreparedContent(url, preparedDocument)
      }

      const { pathname } = new URL(url)
      const croppedPathname = decodeURIComponent(
        pathname
          .split('/')
          [pathname.split('/').length - 1].split('.')
          .slice(0, -1)
          .join('.')
      ).replace(/_/gi, ' ')

      const slug = generateSlug(
        parsedResult?.parsedContent?.title || croppedPathname
      )
      const itemToSave = parsedContentToLibraryItem({
        url,
        title: req.body.title,
        parsedContent: parsedResult?.parsedContent || null,
        userId,
        slug,
        croppedPathname,
        itemType: parsedResult?.pageType || PageType.Unknown,
        canonicalUrl: url,
        folder: FOLDER,
        rssFeedUrl: feedUrl,
        preparedDocument,
        savedAt: req.body.savedAt,
        publishedAt: req.body.publishedAt,
        state: ArticleSavingRequestStatus.ContentNotFetched,
      })

      const newItem = await createOrUpdateLibraryItem(itemToSave, userId)
      logger.info('feed item saved in following')

      // save RSS label in the item
      await createAndSaveLabelsInLibraryItem(
        newItem.id,
        userId,
        [{ name: 'RSS' }],
        feedUrl
      )

      logger.info('RSS label added to the item')

      return res.sendStatus(200)
    }

    res.sendStatus(200)
  })

  return router
}
