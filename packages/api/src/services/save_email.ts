import { generateSlug, stringToHash, validatedDate } from '../utils/helpers'
import { parsePreparedContent, parseUrlMetadata } from '../utils/parser'
import normalizeUrl from 'normalize-url'
import { PubsubClient } from '../datalayer/pubsub'
import { ArticleSavingRequestStatus, Page } from '../elastic/types'
import { createPage, getPageByParam, updatePage } from '../elastic/pages'

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
    true
  )
  const content = parseResult.parsedContent?.content || input.originalContent
  const slug = generateSlug(input.title)
  const metadata = await parseUrlMetadata(url)

  const articleToSave: Page = {
    id: '',
    userId: ctx.uid,
    slug,
    content,
    originalHtml: input.originalContent,
    description: metadata?.description || parseResult.parsedContent?.excerpt,
    title: input.title,
    author: input.author,
    url: normalizeUrl(parseResult.canonicalUrl || url, {
      stripHash: true,
      stripWWW: false,
    }),
    pageType: parseResult.pageType,
    hash: stringToHash(content),
    image: metadata?.previewImage || parseResult.parsedContent?.previewImage,
    publishedAt: validatedDate(parseResult.parsedContent?.publishedDate),
    createdAt: new Date(),
    savedAt: new Date(),
    readingProgressAnchorIndex: 0,
    readingProgressPercent: 0,
    subscription: input.author,
    state: ArticleSavingRequestStatus.Succeeded,
  }

  const page = await getPageByParam({ userId: ctx.uid, url: articleToSave.url })
  if (page) {
    const result = await updatePage(page.id, { archivedAt: null }, ctx)
    console.log('updated page from email', result)

    return page
  }

  const pageId = await createPage(articleToSave, ctx)
  if (!pageId) {
    console.log('failed to create new page')

    return undefined
  }

  articleToSave.id = pageId

  return articleToSave
}
