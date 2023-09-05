import {
  LibraryItem,
  LibraryItemState,
  LibraryItemType,
} from '../entity/library_item'
import { authTrx } from '../repository'
import { getInternalLabelWithColor } from '../repository/label'
import { libraryItemRepository } from '../repository/library_item'
import { enqueueThumbnailTask } from '../utils/createTask'
import {
  cleanUrl,
  generateSlug,
  isBase64Image,
  stringToHash,
  validatedDate,
  wordsCount,
} from '../utils/helpers'
import { logger } from '../utils/logger'
import {
  FAKE_URL_PREFIX,
  fetchFavicon,
  parsePreparedContent,
  parseUrlMetadata,
} from '../utils/parser'
import { findOrCreateLabels } from './labels'
import { createLibraryItem } from './library_item'
import { updateReceivedEmail } from './received_emails'
import { saveSubscription } from './subscriptions'

export type SaveEmailInput = {
  userId: string
  originalContent: string
  url: string
  title: string
  author: string
  unsubMailTo?: string
  unsubHttpUrl?: string
  newsletterEmailId?: string
  receivedEmailId: string
}

const isStubUrl = (url: string): boolean => {
  return url.startsWith(FAKE_URL_PREFIX)
}

export const saveEmail = async (
  input: SaveEmailInput
): Promise<LibraryItem | undefined> => {
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
  const cleanedUrl = cleanUrl(parseResult.canonicalUrl || url)
  let siteIcon = parseResult.parsedContent?.siteIcon
  if (!siteIcon || isBase64Image(siteIcon)) {
    // fetch favicon if not already set or is a base64 image
    siteIcon = await fetchFavicon(url)
  }

  const existingLibraryItem = await authTrx((t) =>
    t.withRepository(libraryItemRepository).findOneBy({
      originalUrl: cleanedUrl,
      state: LibraryItemState.Succeeded,
    })
  )
  if (existingLibraryItem) {
    const updatedLibraryItem = await libraryItemRepository.save({
      ...existingLibraryItem,
      archivedAt: null,
    })
    logger.info('updated page from email', updatedLibraryItem)

    return updatedLibraryItem
  }

  const newsletterLabel = getInternalLabelWithColor('newsletter')

  // start a transaction to create the library item and update the received email
  const newLibraryItem = await createLibraryItem(
    {
      user: { id: input.userId },
      slug,
      readableContent: content,
      originalContent: input.originalContent,
      description: metadata?.description || parseResult.parsedContent?.excerpt,
      title: input.title,
      author: input.author,
      originalUrl: cleanedUrl,
      itemType: parseResult.pageType as unknown as LibraryItemType,
      textContentHash: stringToHash(content),
      thumbnail:
        metadata?.previewImage ||
        parseResult.parsedContent?.previewImage ||
        undefined,
      publishedAt: validatedDate(
        parseResult.parsedContent?.publishedDate ?? undefined
      ),
      state: LibraryItemState.Succeeded,
      siteIcon,
      siteName: parseResult.parsedContent?.siteName ?? undefined,
      wordCount: wordsCount(content),
    },
    input.userId
  )

  if (input.newsletterEmailId) {
    await saveSubscription({
      userId: input.userId,
      name: input.author,
      unsubscribeMailTo: input.unsubMailTo,
      unsubscribeHttpUrl: input.unsubHttpUrl,
      icon: siteIcon,
      newsletterEmailId: input.newsletterEmailId,
    })
  }

  if (newsletterLabel) {
    // add newsletter label
    await findOrCreateLabels([newsletterLabel], input.userId)
  }

  await updateReceivedEmail(input.receivedEmailId, 'article')

  // create a task to update thumbnail and pre-cache all images
  try {
    const taskId = await enqueueThumbnailTask(input.userId, slug)
    logger.info('Created thumbnail task', { taskId })
  } catch (e) {
    logger.error('Failed to create thumbnail task', e)
  }

  return newLibraryItem
}
