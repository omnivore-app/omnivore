import { logger } from '../../utils/logger'
import { v4 as uuid } from 'uuid'

import { OpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { LibraryItem } from '../../entity/library_item'
import {
  htmlToSpeechFile,
  SpeechFile,
  SSMLOptions,
} from '@omnivore/text-to-speech-handler'
import axios from 'axios'
import {
  findLibraryItemsByIds,
  searchLibraryItems,
} from '../../services/library_item'
import { redisDataSource } from '../../redis_data_source'
import { htmlToMarkdown } from '../../utils/parser'
import yaml from 'yaml'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import showdown from 'showdown'
import { Digest, writeDigest } from '../../services/digest'
import { TaskState } from '../../generated/graphql'

export type CreateDigestJobSchedule = 'daily' | 'weekly'

export interface CreateDigestJobData {
  id: string
  userId: string
  voices?: string[]
  language?: string
  rate?: string
  libraryItemIds?: string[]
}

export interface CreateDigestJobResponse {
  jobId: string
  jobState: TaskState
}
interface Selector {
  query: string
  count: number
  reason: string
}

interface ZeroShotDefinition {
  userPreferencesProfilePrompt: string
  rankPrompt: string
}

interface DigestDefinition {
  name: string
  preferenceSelectors: Selector[]
  candidateSelectors: Selector[]
  contentFeaturesPrompt: string
  contentRatingPrompt: string
  summaryPrompt: string
  assemblePrompt: string

  zeroShot: ZeroShotDefinition
}

interface RankedItem {
  topic: string
  summary: string
  libraryItem: LibraryItem
}

interface RankedTitle {
  topic: string
  id: string
  title: string
}

export const CREATE_DIGEST_JOB = 'create-digest'

let digestDefinition: DigestDefinition

const fetchDigestDefinition = async (): Promise<DigestDefinition> => {
  const promptFileUrl = process.env.PROMPT_FILE_URL
  if (!promptFileUrl) {
    const msg = 'PROMPT_FILE_URL not set'
    logger.error(msg)
    throw new Error(msg)
  }

  // fetch the yaml file
  const response = await axios.get<string>(promptFileUrl)

  // parse the yaml file
  return yaml.parse(response.data) as DigestDefinition
}

// Makes multiple DB queries and combines the results
const getPreferencesList = async (userId: string): Promise<LibraryItem[]> => {
  // use the queries from the digest definitions to lookup preferences
  // There should be a list of multiple queries we use. For now we can
  // hardcode these queries:
  // - query: "in:all is:read OR has:highlights sort:updated-desc wordsCount:>=20"
  //   count: 21
  //   reason: "recently read or highlighted items that are not part of the digest"
  // - query: "in:all is:read OR has:highlights sort:saved-asc wordsCount:>=20"
  //   count: 4
  //   reason: "some older items that were interacted with"

  const preferences = await Promise.all(
    digestDefinition.preferenceSelectors.map(async (selector) => {
      // use the selector to fetch items
      const results = await searchLibraryItems(
        {
          query: selector.query,
          size: selector.count,
        },
        userId
      )

      return results.libraryItems
    })
  )

  // deduplicate and flatten the items
  const dedupedPreferences = preferences
    .flat()
    .filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    )

  return dedupedPreferences
}

// Makes multiple DB queries and combines the results
const getCandidatesList = async (
  userId: string,
  libraryItemIds?: string[]
): Promise<LibraryItem[]> => {
  // use the queries from the digest definitions to lookup preferences
  // There should be a list of multiple queries we use. For now we can
  // hardcode these queries:
  // - query: "in:all is:unread saved:last24hrs sort:saved-desc wordsCount:>=500"
  //   count: 100
  //   reason: "most recent 100 items saved over 500 words

  if (libraryItemIds) {
    return findLibraryItemsByIds(libraryItemIds, userId)
  }

  const candidates = await Promise.all(
    digestDefinition.candidateSelectors.map(async (selector) => {
      // use the selector to fetch items
      const results = await searchLibraryItems(
        {
          includeContent: true,
          query: selector.query,
          size: selector.count,
        },
        userId
      )

      return results.libraryItems
    })
  )

  // deduplicate and flatten the items
  const dedupedCandidates = candidates
    .flat()
    .filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    )
    .map((item) => ({
      ...item,
      readableContent: htmlToMarkdown(item.readableContent),
    })) // convert the html content to markdown

  return dedupedCandidates
}

// Takes a list of library items, and uses a prompt to generate
// a text representation of a user profile
const createUserProfile = async (
  preferences: LibraryItem[]
): Promise<string> => {
  const llm = new OpenAI({
    modelName: 'gpt-4-0125-preview',
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  })

  const contextualTemplate = PromptTemplate.fromTemplate(
    digestDefinition.zeroShot.userPreferencesProfilePrompt
  )

  const chain = contextualTemplate.pipe(llm)
  const result = await chain.invoke({
    titles: preferences.map((item) => `* ${item.title}`).join('\n'),
  })

  return result
}

// Checks redis for a user profile, if not found creates one and writes
// it to redis
const findOrCreateUserProfile = async (userId: string): Promise<string> => {
  // check redis for user profile, return if found
  const key = `userProfile:${userId}`
  const existingProfile = await redisDataSource.redisClient?.get(key)
  if (existingProfile) {
    return existingProfile
  }

  // if not found
  const preferences = await getPreferencesList(userId)
  const profile = await createUserProfile(preferences)

  // write to redis here and ttl is 1 week
  await redisDataSource.redisClient?.set(key, profile, 'EX', 60 * 60 * 24 * 7)

  return profile
}

// Uses OpenAI to rank all the titles based on the user profiles
const rankCandidates = async (
  candidates: LibraryItem[],
  userProfile: string
): Promise<RankedItem[]> => {
  const llm = new OpenAI({
    modelName: 'gpt-4-0125-preview',
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  })

  const contextualTemplate = PromptTemplate.fromTemplate(
    digestDefinition.zeroShot.rankPrompt
  )

  const outputParser = new JsonOutputParser()
  const chain = contextualTemplate.pipe(llm).pipe(outputParser)
  const contextStr = await chain.invoke({
    userProfile,
    titles: JSON.stringify(
      candidates.map((item) => ({
        id: item.id,
        title: item.title,
      }))
    ),
  })

  logger.info('contextStr: ', contextStr)
  // convert the json output to an array of ranked candidates
  const rankedCandidate = contextStr as RankedTitle[]

  // map the ranked titles to the library items based on id
  const rankedItems = rankedCandidate
    .map((item) => {
      const libraryItem = candidates.find((t) => t.id === item.id)
      return {
        topic: item.topic,
        libraryItem,
        summary: '',
      }
    })
    .filter((item) => item.libraryItem !== undefined) as RankedItem[]

  return rankedItems
}

// Does some grouping by topic while trying to maintain ranking
// adds some basic topic diversity
const chooseRankedSelections = (rankedCandidates: RankedItem[]) => {
  const selected = []
  const rankedTopics = []
  const topicCount = {} as Record<string, number>

  for (const item of rankedCandidates) {
    if (selected.length >= 5) {
      break
    }

    topicCount[item.topic] = (topicCount[item.topic] || 0) + 1

    if (topicCount[item.topic] <= 2) {
      selected.push(item)
      if (rankedTopics.indexOf(item.topic) === -1) {
        rankedTopics.push(item.topic)
      }
    }
  }

  logger.info('rankedTopics: ', rankedTopics)
  logger.info('finalSelections: ', selected)

  const finalSelections = []

  for (const topic of rankedTopics) {
    const matches = selected.filter((item) => item.topic == topic)
    finalSelections.push(...matches)
  }

  logger.info('finalSelections: ', finalSelections)

  return finalSelections
}

const summarizeItems = async (
  rankedCandidates: RankedItem[]
): Promise<RankedItem[]> => {
  const llm = new OpenAI({
    modelName: 'gpt-4-0125-preview',
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  })

  const contextualTemplate = PromptTemplate.fromTemplate(
    digestDefinition.summaryPrompt
  )
  const chain = contextualTemplate.pipe(llm)

  // send all the ranked candidates to openAI at once in a batch
  const summaries = await chain.batch(
    rankedCandidates.map((item) => ({
      title: item.libraryItem.title,
      author: item.libraryItem.author ?? '',
      content: item.libraryItem.readableContent, // markdown content
    }))
  )

  summaries.forEach(
    (summary, index) => (rankedCandidates[index].summary = summary)
  )

  return rankedCandidates
}

// generate speech files from the summaries
const generateSpeechFiles = (
  rankedItems: RankedItem[],
  options: SSMLOptions
): SpeechFile[] => {
  // convert the summaries from markdown to HTML
  const converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
  })

  const speechFiles = rankedItems.map((item) => {
    const html = `
    <div id="readability-content">
      <div id="readability-page-1">
        ${converter.makeHtml(item.summary)}
      </div>
    </div>`
    return htmlToSpeechFile({
      content: html,
      options,
    })
  })

  return speechFiles
}

// we should have a QA step here that does some
// basic checks to make sure the summaries are good.
const filterSummaries = (summaries: RankedItem[]): RankedItem[] => {
  return summaries.filter((item) => item.summary.length > 100)
}

// we can use something more sophisticated to generate titles
const generateTitle = (summaries: RankedItem[]): string =>
  'Omnivore digest: ' +
  summaries.map((item) => item.libraryItem.title).join(', ')

// generate description based on the summaries
const generateDescription = (summaries: RankedItem[]): string =>
  `We selected ${
    summaries.length
  } articles from your last 24 hours of saved items, covering ${summaries
    .map((summary) => summary.topic)
    .join(', ')}.`

// generate content based on the summaries
const generateContent = (summaries: RankedItem[]): string =>
  summaries
    .map((summary) => `## ${summary.libraryItem.title}\n ${summary.summary}`)
    .join('\n\n')

const generateByline = (summaries: RankedItem[]): string =>
  summaries
    .filter((summary) => !!summary.libraryItem.author)
    .map((item) => item.libraryItem.author)
    .join(', ')

export const createDigestJob = async (jobData: CreateDigestJobData) => {
  digestDefinition = await fetchDigestDefinition()

  const candidates = await getCandidatesList(jobData.userId)
  const userProfile = await findOrCreateUserProfile(jobData.userId)
  const rankedCandidates = await rankCandidates(candidates, userProfile)
  const selections = chooseRankedSelections(rankedCandidates)

  const summaries = await summarizeItems(selections)

  const filteredSummaries = filterSummaries(summaries)

  const speechFiles = generateSpeechFiles(filteredSummaries, {
    ...jobData,
    primaryVoice: jobData.voices?.[0],
    secondaryVoice: jobData.voices?.[1],
  })
  const title = generateTitle(summaries)
  const digest: Digest = {
    id: jobData.id,
    title,
    content: generateContent(summaries),
    urlsToAudio: [],
    jobState: TaskState.Succeeded,
    speechFiles,
    chapters: filteredSummaries.map((item, index) => ({
      title: item.libraryItem.title,
      id: item.libraryItem.id,
      url: item.libraryItem.originalUrl,
      thumbnail: item.libraryItem.thumbnail ?? undefined,
      wordCount: speechFiles[index].wordCount,
    })),
    createdAt: new Date(),
    description: generateDescription(summaries),
    byline: generateByline(summaries),
  }

  await writeDigest(jobData.userId, digest)
}
