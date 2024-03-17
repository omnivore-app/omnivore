import { logger } from '../utils/logger'
import { libraryItemRepository } from '../repository/library_item'
import { htmlToMarkdown } from '../utils/parser'
import { LibraryItem } from '../entity/library_item'
import { searchLibraryItems } from '../services/library_item'
import { OpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { env } from '../env'

export interface BuildDigestJobData {
  userId: string
}

export const BUILD_DIGEST_JOB_NAME = 'build-digest-job'

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

const createPreferencesList = async (
  userId: string
): Promise<LibraryItem[]> => {
  const recentPreferences = await searchLibraryItems(
    {
      from: 0,
      size: 21,
      includePending: false,
      includeDeleted: false,
      includeContent: false,
      useFolders: false,
      query: `is:read OR has:highlights sort:saved-desc`,
    },
    userId
  )
  return recentPreferences.libraryItems
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

const createCandidatesList = async (userId: string): Promise<LibraryItem[]> => {
  const candidates = await searchLibraryItems(
    {
      from: 0,
      size: 100,
      includePending: false,
      includeDeleted: false,
      includeContent: false,
      useFolders: false,
      query: `is:unread sort:saved-desc`,
    },
    userId
  )
  return removeDuplicateTitles(candidates.libraryItems)
}

const isSelectedLibraryItem = (
  item: SelectedLibraryItem | undefined
): item is SelectedLibraryItem => {
  return !!item
}

const getSelection = async (
  llm: OpenAI,
  candidates: LibraryItem[],
  recentPreferences: LibraryItem[]
): Promise<SelectedLibraryItem[]> => {
  if (!process.env.DIGEST_SELECTION_PROMPT) {
    return []
  }

  const selectionTemplate = PromptTemplate.fromTemplate(
    process.env.DIGEST_SELECTION_PROMPT
  )
  const selectionChain = selectionTemplate.pipe(llm)
  const selectionResult = await selectionChain.invoke(
    {
      candidates: JSON.stringify(
        candidates.map((item: LibraryItem) => {
          return { id: item.id, title: item.title }
        })
      ),
      preferences: JSON.stringify(
        recentPreferences.map((item: LibraryItem) => {
          return { id: item.id, title: item.title }
        })
      ),
    },
    {}
  )

  console.log('[digest]: selectionResult: ', selectionResult)

  const selection = JSON.parse(selectionResult) as SelectionResultItem[]
  console.log('[digest]: selection: ', selection)
  console.log(
    '[digest]:  candidates: ',
    candidates.map((item) => item.id)
  )

  return selection
    .map((item) => {
      const libraryItem = candidates.find((candidate) => {
        return candidate.id == item.id
      })
      if (!libraryItem) {
        console.log('[digest]:  missing library item: ', item)
        return undefined
      }
      return {
        id: libraryItem.id,
        title: libraryItem.title,
        topic: item.topic,
        url: `${env.client.url}/me/${libraryItem.slug}`,
      }
    })
    .filter(isSelectedLibraryItem)
}

const createDigestArticleContent = async (
  llm: OpenAI,
  candidates: LibraryItem[],
  selection: SelectedLibraryItem[]
): Promise<string | undefined> => {
  if (!process.env.DIGEST_INTRODUCTION_PROMPT) {
    return undefined
  }
  const introductionTemplate = PromptTemplate.fromTemplate(
    process.env.DIGEST_INTRODUCTION_PROMPT
  )
  const introductionChain = introductionTemplate.pipe(llm)
  const introductionResult = await introductionChain.invoke({
    selections: JSON.stringify(selection),
  })

  console.log(`[digest]: markdown:`, { introductionResult })

  return introductionResult
}

export const buildDigest = async (jobData: BuildDigestJobData) => {
  try {
    console.log(
      '[digest]: ********************************* building daily digest ***********************************'
    )
    const candidates = await createCandidatesList(jobData.userId)
    const recentPreferences = await createPreferencesList(jobData.userId)

    console.log(
      '[digest]: preferences: ',
      recentPreferences.map((item: LibraryItem) => item.title)
    )
    console.log(
      '[digest]: candidates: ',
      candidates.map((item: LibraryItem) => `${item.id}: ${item.title}`)
    )

    const llm = new OpenAI({
      modelName: 'gpt-4', // gpt-4-1106-preview
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    })

    const selection = await getSelection(llm, candidates, recentPreferences)
    const articleHTML = await createDigestArticleContent(
      llm,
      candidates,
      selection
    )

    console.log('[digest]: INTRODUCTION RESULT: ', articleHTML)
  } catch (err) {
    console.log('error creating summary: ', err)
  }
}
