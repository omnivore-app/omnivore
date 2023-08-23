import { createPage, getPageByParam, updatePage } from '../elastic/pages'
import { ArticleSavingRequestStatus, Page } from '../elastic/types'
import { PubsubClient } from '../pubsub'
import { enqueueThumbnailTask } from '../utils/createTask'
import {
  cleanUrl,
  generateSlug,
  stringToHash,
  validatedDate,
  wordsCount,
} from '../utils/helpers'
import { logger } from '../utils/logger'
import {
  FAKE_URL_PREFIX,
  parsePreparedContent,
  parseUrlMetadata,
} from '../utils/parser'

export type SaveContext = {
  pubsub: PubsubClient
  uid: string
  refresh?: boolean
}

export type SaveEmailInput = {
  originalContent: string
  url: string
  title: string
  author: string
  unsubMailTo?: string
  unsubHttpUrl?: string
}

const isStubUrl = (url: string): boolean => {
  return url.startsWith(FAKE_URL_PREFIX)
}

export const saveEmail = async (
  ctx: SaveContext,
  input: SaveEmailInput
): Promise<Page | undefined> => {
  const url = input.url
  const parseResult = await parsePreparedContent(
    url,
    {
      document: input.originalContent,
      pageInfo: {
        // can leave this empty for now
      },
    },
    null,
    true
  )
  const content = parseResult.parsedContent?.content || input.originalContent
  const slug = generateSlug(input.title)
  const metadata = isStubUrl(url) ? undefined : await parseUrlMetadata(url)

  const articleToSave: Page = {
    id: '',
    userId: ctx.uid,
    slug,
    content,
    originalHtml: input.originalContent,
    description: metadata?.description || parseResult.parsedContent?.excerpt,
    title: input.title,
    author: input.author,
    url: cleanUrl(parseResult.canonicalUrl || url),
    pageType: parseResult.pageType,
    hash: stringToHash(content),
    image:
      metadata?.previewImage ||
      parseResult.parsedContent?.previewImage ||
      undefined,
    publishedAt: validatedDate(
      parseResult.parsedContent?.publishedDate ?? undefined
    ),
    createdAt: new Date(),
    savedAt: new Date(),
    readingProgressAnchorIndex: 0,
    readingProgressPercent: 0,
    subscription: input.author,
    state: ArticleSavingRequestStatus.Succeeded,
    siteIcon: parseResult.parsedContent?.siteIcon ?? undefined,
    siteName: parseResult.parsedContent?.siteName ?? undefined,
    wordsCount: wordsCount(content),
  }

  const page = await getPageByParam({
    userId: ctx.uid,
    url: articleToSave.url,
    state: ArticleSavingRequestStatus.Succeeded,
  })
  if (page) {
    const result = await updatePage(page.id, { archivedAt: null }, ctx)
    logger.info('updated page from email', result)

    return page
  }

  const pageId = await createPage(articleToSave, ctx)
  if (!pageId) {
    logger.info('failed to create new page')

    return undefined
  }

  // create a task to update thumbnail and pre-cache all images
  try {
    const taskId = await enqueueThumbnailTask(ctx.uid, slug)
    logger.info('Created thumbnail task', { taskId })
  } catch (e) {
    logger.error('Failed to create thumbnail task', e)
  }

  articleToSave.id = pageId

  return articleToSave
}
