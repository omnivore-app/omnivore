import { logger } from '../utils/logger'
import { parsePreparedContent } from '../utils/parser'
import { LibraryItem } from '../entity/library_item'
import {
  createOrUpdateLibraryItem,
  findLibraryItemById,
  searchLibraryItems,
} from '../services/library_item'
import { OpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { v4 as uuid } from 'uuid'

import { env } from '../env'
import showdown from 'showdown'
import { parsedContentToLibraryItem, savePage } from '../services/save_page'
import { generateSlug } from '../utils/helpers'
import { PageType } from '../generated/graphql'
import { readStringFromStorage } from '../utils/uploads'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { MarkdownTextSplitter } from 'langchain/text_splitter'
import { loadSummarizationChain } from 'langchain/chains'
import { JsonOutputParser } from '@langchain/core/output_parsers'

export interface BuildDigestJobData {
  userId: string
}

export const BUILD_DIGEST_JOB_NAME = 'build-digest-job'

interface Selector {
  query: string
  count: number
  reason: string
}

interface DigestDefinition {
  name: string
  preferenceSelectors: Selector[]
  candidateSelectors: Selector[]
  fastMatchAttributes: string[]

  selectionPrompt: string
  assemblePrompt: string
  introductionCopy: string[]

  topics: string[]
  contextualizeItemsPrompt: string
}

interface ItemContext {
  topic: string
  //  summary: string
  introduction: string
}

type ContextualizedItem = {
  libraryItem: LibraryItem
  context: ItemContext
}

interface SelectionResultItem {
  id: string
  title: string
  topic: string
  reason: string
}

interface SelectedLibraryItem {
  id: string
  title: string
  topic: string
  url: string
}

const fetchDigestDefinition = async (): Promise<
  DigestDefinition | undefined
> => {
  const bucketName = env.fileUpload.gcsUploadBucket

  try {
    const str = await readStringFromStorage(
      bucketName,
      `digest-builders/simple-001.json`
    )
    return JSON.parse(str) as DigestDefinition
  } catch (err) {
    logger.info(`unable to digest definition`, { error: err })
  }

  return undefined
}

function removeDuplicateTitles(items: LibraryItem[]): LibraryItem[] {
  const uniqueTitles: Set<string> = new Set()
  const uniqueItems: LibraryItem[] = []

  for (const item of items) {
    if (!uniqueTitles.has(item.title)) {
      uniqueTitles.add(item.title)
      uniqueItems.push(item)
    }
  }

  return uniqueItems
}

const createPreferencesList = async (
  digestDefinition: DigestDefinition,
  userId: string
): Promise<LibraryItem[]> => {
  const result: LibraryItem[] = []
  for (const selector of digestDefinition.preferenceSelectors) {
    const recentPreferences = await searchLibraryItems(
      {
        from: 0,
        size: selector.count,
        includePending: false,
        includeDeleted: false,
        includeContent: false,
        useFolders: false,
        query: selector.query,
      },
      userId
    )
    result.push(...recentPreferences.libraryItems)
  }
  return result
}

const createCandidatesList = async (
  digestDefinition: DigestDefinition,
  userId: string
): Promise<LibraryItem[]> => {
  const result: LibraryItem[] = []
  for (const selector of digestDefinition.candidateSelectors) {
    console.log(`candidate selector: ${selector.query}`)

    const candidates = await searchLibraryItems(
      {
        from: 0,
        size: selector.count,
        includePending: false,
        includeDeleted: false,
        includeContent: true,
        useFolders: false,
        query: selector.query,
      },
      userId
    )
    result.push(...candidates.libraryItems)
  }
  return removeDuplicateTitles(result)
}

const isContextualLibraryItem = (
  item: ContextualizedItem | undefined
): item is ContextualizedItem => {
  return !!item
}

const getSelection = async (
  llm: OpenAI,
  digestDefinition: DigestDefinition,
  preferences: LibraryItem[],
  candidates: ContextualizedItem[]
): Promise<ContextualizedItem[]> => {
  const selectionTemplate = PromptTemplate.fromTemplate(
    digestDefinition.selectionPrompt
  )
  const selectionChain = selectionTemplate.pipe(llm)
  const selectionResult = await selectionChain.invoke({
    candidates: JSON.stringify(
      candidates.map((item: ContextualizedItem) => {
        return {
          id: item.libraryItem.id,
          title: item.libraryItem.title,
          topic: item.context.topic,
        }
      })
    ),
    preferences: JSON.stringify(
      preferences.map((item: LibraryItem) => {
        return { id: item.id, title: item.title }
      })
    ),
  })

  const selection = JSON.parse(selectionResult) as SelectionResultItem[]
  console.log('[digest]: selection: ', selection)

  return selection
    .map((item) => {
      const selected = candidates.find((candidate) => {
        return candidate.libraryItem.id == item.id
      })
      if (!selected) {
        console.log('[digest]:  missing library item: ', item)
        return undefined
      }
      return selected
    })
    .filter(isContextualLibraryItem)
}

const assemble = async (
  llm: OpenAI,
  digestDefinition: DigestDefinition,
  contextualizedData: ContextualizedItem[]
): Promise<string | undefined> => {
  let markdown = ''

  for (const topic of digestDefinition.topics) {
    const matches = contextualizedData.filter(
      (item) => item.context.topic == topic
    )
    if (matches.length > 0) {
      markdown += '## ' + topic + '\n\n'
      for (const item of matches) {
        markdown += `### [${item.libraryItem.title}](${env.client.url}/me/${item.libraryItem.slug})\n\n`
        markdown += item.context.introduction
        markdown += '\n\n'
      }
    }
  }

  console.log(`[digest]: markdown:`, { markdown })

  const converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
  })

  const originalContent = converter.makeHtml(`
  Hello, this is your Omnivore daily digest. We want to make it easy for you to enjoy reading every day. To do 
  that we've picked some of the best items that were recently added to your library and created a digest. Enjoy!\n\n${markdown}`)

  return Promise.resolve(originalContent)
}

export const createSummarizableDocument = (readable: string): string => {
  const nhm = new NodeHtmlMarkdown({
    keepDataImages: false,
  })
  return nhm.translate(readable)
}

const summarize = async (
  llm: OpenAI,
  markdown: string
): Promise<string | undefined> => {
  const textSplitter = new MarkdownTextSplitter({ chunkSize: 10_000 })
  const docs = await textSplitter.createDocuments([markdown])
  const summarize = loadSummarizationChain(llm, {
    type: 'map_reduce',
    verbose: true,
  })

  const response = await summarize.invoke({
    input_documents: docs,
  })

  if (typeof response.text !== 'string') {
    logger.error(`Summarize did not return text`)
    return undefined
  }

  return response.text
}

const contextualize = async (
  llm: OpenAI,
  digestDefinition: DigestDefinition,
  items: LibraryItem[]
): Promise<ContextualizedItem[]> => {
  const result: ContextualizedItem[] = []
  const contextualTemplate = PromptTemplate.fromTemplate(
    digestDefinition.contextualizeItemsPrompt
  )

  for (const item of items) {
    const markdown = createSummarizableDocument(item.readableContent)
    // const summary = await summarize(llm, markdown)
    // if (!summary) {
    //   console.log('could not summarize document: ', item.title)
    //   continue
    // }

    try {
      const outputParser = new JsonOutputParser()
      const chain = contextualTemplate.pipe(llm).pipe(outputParser)
      const contextStr = await chain.invoke({
        content: markdown,
        topics: JSON.stringify(digestDefinition.topics),
      })

      console.log(`[digest]: contextualize result:`, {
        title: item.title,
        context: contextStr,
      })
      result.push({
        libraryItem: item,
        context: contextStr as ItemContext,
      })
    } catch (error) {
      console.log(`error contextualizing: ${item.title}`, { error })
    }
  }

  return result
}

export const buildDigest = async (jobData: BuildDigestJobData) => {
  try {
    console.log(
      '[digest]: ********************************* building daily digest ***********************************'
    )
    const digestDefinition = await fetchDigestDefinition()
    if (!digestDefinition) {
      logger.warn('[digest] no digest definition found')
      return
    }

    const candidates = await createCandidatesList(
      digestDefinition,
      jobData.userId
    )
    const preferences = await createPreferencesList(
      digestDefinition,
      jobData.userId
    )

    console.log(
      '[digest]: preferences: ',
      preferences.map((item: LibraryItem) => item.title)
    )

    console.log(
      '[digest]: candidates: ',
      candidates.map((item: LibraryItem) => `${item.id}: ${item.title}`)
    )

    const llm = new OpenAI({
      modelName: 'gpt-4-0125-preview',
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    })

    const contextualizedItems = await contextualize(
      llm,
      digestDefinition,
      candidates
    )

    console.log('contextualizedData: ', {
      contextualizeData: JSON.stringify(
        contextualizedItems.map((item) => {
          return {
            title: item.libraryItem.title,
            topic: item.context.topic,
            introduction: item.context.introduction,
          }
        })
      ),
    })

    const selection = await getSelection(
      llm,
      digestDefinition,
      preferences,
      contextualizedItems
    )

    const articleHTML = await assemble(llm, digestDefinition, selection)
    if (articleHTML) {
      const preparedDocument = {
        document: articleHTML,
        pageInfo: {},
      }

      const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date())

      const title = `Your Omnivore Daily Digest for ${formattedDate}`
      const originalURL = `https://omnivore.app/me/digest?q=${uuid()}`
      const updatedContent = await parsePreparedContent(
        originalURL,
        preparedDocument,
        true
      )

      const slug = generateSlug(title)
      const libraryItemToSave = parsedContentToLibraryItem({
        croppedPathname: 'digest',
        itemType: PageType.Article,
        url: originalURL,
        slug: slug,
        userId: jobData.userId,
        title: title,
        parsedContent: updatedContent.parsedContent,
        originalHtml: articleHTML,
        preparedDocument: preparedDocument,
      })

      // create new item in database
      await createOrUpdateLibraryItem(libraryItemToSave, jobData.userId)
    }

    console.log('[digest]: INTRODUCTION RESULT: ', articleHTML)
  } catch (err) {
    console.log('error creating summary: ', err)
  }
}
