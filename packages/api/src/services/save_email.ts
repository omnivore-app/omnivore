import { PubsubClient } from '../datalayer/pubsub'
import { DataModels } from '../resolvers/types'
import { generateSlug, stringToHash, validatedDate } from '../utils/helpers'
import {
  parseOriginalContent,
  parsePreparedContent,
  parseUrlMetadata,
} from '../utils/parser'
import normalizeUrl from 'normalize-url'
import { kx } from '../datalayer/knex_config'
import { UserArticleData } from '../datalayer/links/model'
import { setClaims } from '../datalayer/helpers'

export type SaveContext = {
  pubsub: PubsubClient
  models: DataModels
}

export type SaveEmailInput = {
  originalContent: string
  url: string
  title: string
  author: string
}

export const saveEmail = async (
  ctx: SaveContext,
  saverId: string,
  input: SaveEmailInput
): Promise<UserArticleData | undefined> => {
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

  const title = input.title
  const content = parseResult.parsedContent?.content || input.originalContent
  const slug = generateSlug(title)

  const pageType = parseOriginalContent(url, input.originalContent)
  const metadata = await parseUrlMetadata(url)

  const articleToSave = {
    originalHtml: input.originalContent,
    content: content,
    description: metadata?.description || parseResult.parsedContent?.excerpt,
    title: metadata?.title || parseResult.parsedContent?.title || title,
    author:
      metadata?.author || parseResult.parsedContent?.byline || input.author,
    url: normalizeUrl(parseResult.canonicalUrl || url, {
      stripHash: true,
      stripWWW: false,
    }),
    pageType: pageType,
    hash: stringToHash(content),
    image: metadata?.previewImage || parseResult.parsedContent?.previewImage,
    publishedAt: validatedDate(parseResult.parsedContent?.publishedDate),
  }

  if (parseResult.canonicalUrl && parseResult.domContent) {
    // await ctx.pubsub.pageSaved(
    //   saverId,
    //   parseResult.canonicalUrl,
    //   parseResult.domContent
    // )
  }

  const matchedUserArticleRecord = await ctx.models.userArticle.getByParameters(
    saverId,
    {
      articleUrl: articleToSave.url,
    }
  )

  let result: UserArticleData | undefined = undefined
  if (matchedUserArticleRecord) {
    // await ctx.pubsub.pageCreated(saverId, url, input.originalContent)

    await kx.transaction(async (tx) => {
      await setClaims(tx, saverId)
      result = await ctx.models.userArticle.update(
        matchedUserArticleRecord.id,
        {
          savedAt: new Date(),
          archivedAt: null,
        }
      )
    })
    console.log('created matched email', result)
  } else {
    // await ctx.pubsub.pageCreated(saverId, url, input.originalContent)

    await kx.transaction(async (tx) => {
      await setClaims(tx, saverId)

      const articleRecord = await ctx.models.article.create(articleToSave, tx)
      result = await ctx.models.userArticle.create(
        {
          userId: saverId,
          slug: slug,
          articleId: articleRecord.id,
          articleUrl: articleRecord.url,
          articleHash: articleRecord.hash,
        },
        tx
      )
      console.log('created new email', result)
    })
  }

  return result
}
