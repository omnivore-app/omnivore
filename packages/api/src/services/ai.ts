import { NodeHtmlMarkdown } from 'node-html-markdown'
import { AISummary } from '../entity/AISummary'
import { ContentFeatures } from '../entity/content_features'
import { authTrx, getRepository } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { stringToHash } from '../utils/helpers'
import { OpenAI } from '@langchain/openai'
import { DigestDefinition } from '../jobs/build_digest'
import { PromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { LibraryItem } from '../entity/library_item'

export interface AIPrompts {
  contentFeaturesPrompt: string
  contentTeasersPrompt: string
}

export const createSummarizableDocument = (
  title: string,
  readable: string
): string => {
  const nhm = new NodeHtmlMarkdown({
    keepDataImages: false,
  })
  const content = nhm.translate(readable)
  return `## ${title}\n\n` + content
}

const fetchContentFeatures = async (
  llm: OpenAI,
  prompts: AIPrompts,
  title: string,
  content: string
): Promise<ContentFeatures | undefined> => {
  const contextualTemplate = PromptTemplate.fromTemplate(
    prompts.contentFeaturesPrompt
  )

  const outputParser = new JsonOutputParser()
  const chain = contextualTemplate.pipe(llm).pipe(outputParser)
  const contextStr = await chain.invoke({
    content,
  })

  console.log(`[digest]: ai attributes result:`, {
    title: title,
    context: contextStr,
  })

  return contextStr as ContentFeatures
}

export const findOrCreateAIContentFeatures = async (
  llm: OpenAI,
  prompts: AIPrompts,
  userId: string,
  libraryItemId: string
): Promise<ContentFeatures | undefined> => {
  const libraryItem = await authTrx(
    async (tx) =>
      tx.withRepository(libraryItemRepository).findById(libraryItemId),
    undefined,
    userId
  )
  if (!libraryItem) {
    return undefined
  }

  // TODO: also query by prompt id so as we modify our prompts
  // we can create new content features.
  let result = await getRepository(ContentFeatures).findOne({
    where: { libraryItemId },
  })
  console.log('DB RESULT: ', { title: libraryItem.title, result })

  if (result && result.teaser && result.shortTeaser) {
    return result
  }

  const content = createSummarizableDocument(
    libraryItem.title,
    libraryItem.readableContent
  )

  if (!result) {
    const newFeatures = await fetchContentFeatures(
      llm,
      prompts,
      libraryItem.title,
      content
    )
    if (!newFeatures) {
      return undefined
    }
    newFeatures.libraryItemId = libraryItem.id
    result = await getRepository(ContentFeatures).save(newFeatures)
    if (!result) {
      return undefined
    }
  }

  if (!result.teaser || !result.shortTeaser) {
    const teasers = await fetchTeasers(llm, prompts, libraryItem.title, content)
    if (teasers) {
      const updated = await getRepository(ContentFeatures).update(result.id, {
        ...teasers,
      })
      result.teaser = teasers.teaser
      result.shortTeaser = teasers.shortTeaser
    }
    return undefined
  }

  return result
}

export const fetchTeasers = async (
  llm: OpenAI,
  prompts: AIPrompts,
  title: string,
  content: string
): Promise<{ teaser: string; shortTeaser: string } | undefined> => {
  const contextualTemplate = PromptTemplate.fromTemplate(
    prompts.contentTeasersPrompt
  )
  const outputParser = new JsonOutputParser()
  const chain = contextualTemplate.pipe(llm).pipe(outputParser)
  const contextStr = await chain.invoke({
    title,
    content,
  })

  console.log(`[digest]: ai attributes result:`, {
    title: title,
    context: contextStr,
  })

  const teaser = contextStr['teaser']
  const shortTeaser = contextStr['shortTeaser']

  if (!teaser || typeof teaser !== 'string') {
    return undefined
  }

  if (!shortTeaser || typeof shortTeaser !== 'string') {
    return undefined
  }

  return {
    teaser,
    shortTeaser,
  }
}

export const getAISummary = async (data: {
  userId: string
  idx: string
  libraryItemId: string
}): Promise<AISummary | undefined> => {
  const aiSummary = await authTrx(
    async (t) => {
      const repo = t.getRepository(AISummary)
      if (data.idx == 'latest') {
        return repo.findOne({
          where: {
            user: { id: data.userId },
            libraryItem: { id: data.libraryItemId },
          },
          order: { createdAt: 'DESC' },
        })
      } else {
        return repo.findOne({
          where: {
            id: data.idx,
            user: { id: data.userId },
            libraryItem: { id: data.libraryItemId },
          },
        })
      }
    },
    undefined,
    data.userId
  )
  return aiSummary ?? undefined
}
