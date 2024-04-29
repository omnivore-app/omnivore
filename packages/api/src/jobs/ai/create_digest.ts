import { ChatAnthropic } from '@langchain/anthropic'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts'
import { OpenAI } from '@langchain/openai'
import {
  htmlToSpeechFile,
  SpeechFile,
  SSMLOptions,
} from '@omnivore/text-to-speech-handler'
import axios from 'axios'
import showdown from 'showdown'
import yaml from 'yaml'
import { LibraryItem } from '../../entity/library_item'
import { TaskState } from '../../generated/graphql'
import { redisDataSource } from '../../redis_data_source'
import { Digest, writeDigest } from '../../services/digest'
import {
  findLibraryItemsByIds,
  searchLibraryItems,
} from '../../services/library_item'
import { findDeviceTokensByUserId } from '../../services/user_device_tokens'
import { wordsCount } from '../../utils/helpers'
import { logger } from '../../utils/logger'
import { htmlToMarkdown } from '../../utils/parser'
import { sendMulticastPushNotifications } from '../../utils/sendNotification'

export type CreateDigestJobSchedule = 'daily' | 'weekly'

export interface CreateDigestData {
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
export const CRON_PATTERNS = {
  // every day at 10:30 UTC
  daily: '30 10 * * *',
  // every Sunday at 10:30 UTC
  weekly: '30 10 * * 7',
}

let digestDefinition: DigestDefinition

export const getCronPattern = (schedule: CreateDigestJobSchedule) =>
  CRON_PATTERNS[schedule]

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
    digestDefinition.preferenceSelectors.map(
      async (selector) =>
        // use the selector to fetch items
        await searchLibraryItems(
          {
            query: selector.query,
            size: selector.count,
          },
          userId
        )
    )
  )

  // deduplicate and flatten the items
  const dedupedPreferences = preferences
    .flat()
    .filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    )

  return dedupedPreferences
}

const randomSelectCandidates = (candidates: LibraryItem[]): LibraryItem[] => {
  // randomly choose at most 25 candidates
  return candidates.sort(() => 0.5 - Math.random()).slice(0, 25)
}

// Makes multiple DB queries and combines the results
const getCandidatesList = async (
  userId: string,
  selectedLibraryItemIds?: string[]
): Promise<LibraryItem[]> => {
  console.time('getCandidatesList')
  // use the queries from the digest definitions to lookup preferences
  // There should be a list of multiple queries we use. For now we can
  // hardcode these queries:
  // - query: "in:all is:unread saved:last24hrs sort:saved-desc wordsCount:>=500"
  //   count: 100
  //   reason: "most recent 100 items saved over 500 words

  if (selectedLibraryItemIds) {
    return findLibraryItemsByIds(selectedLibraryItemIds, userId)
  }

  // get the existing candidate ids from cache
  const key = `digest:${userId}:existingCandidateIds`
  const existingCandidateIds = await redisDataSource.redisClient?.get(key)

  logger.info('existingCandidateIds: ', { existingCandidateIds })

  const candidates = await Promise.all(
    digestDefinition.candidateSelectors.map(
      async (selector) =>
        // use the selector to fetch items
        await searchLibraryItems(
          {
            includeContent: true,
            // query: existingCandidateIds
            //   ? `(${selector.query}) -includes:${existingCandidateIds}` // exclude the existing candidates
            //   : selector.query,
            query: selector.query,
            size: selector.count,
          },
          userId
        )
    )
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

  logger.info('dedupedCandidates: ', dedupedCandidates)

  console.timeEnd('getCandidatesList')

  if (dedupedCandidates.length === 0) {
    logger.info('No new candidates found')

    if (existingCandidateIds) {
      // reuse the existing candidates
      const existingIds = existingCandidateIds.split(',')
      return findLibraryItemsByIds(existingIds, userId)
    }

    // return empty array if no existing candidates
    return []
  }

  const selectedCandidates = randomSelectCandidates(dedupedCandidates)

  logger.info('selectedCandidates: ', selectedCandidates)

  // store the ids in cache
  const candidateIds = selectedCandidates.map((item) => item.id).join(',')
  await redisDataSource.redisClient?.set(key, candidateIds)

  return selectedCandidates
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

  const contextualTemplate = ChatPromptTemplate.fromTemplate(
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
  const key = `digest:${userId}:userProfile`
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

const filterTopics = (rankedTopics: string[]) =>
  rankedTopics.filter((topic) => topic?.length > 0)

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

  const finalSelections = []

  for (const topic of rankedTopics) {
    const matches = selected.filter((item) => item.topic == topic)
    finalSelections.push(...matches)
  }

  logger.info(
    'finalSelections: ',
    finalSelections.map((item) => item.libraryItem.title)
  )

  return {
    finalSelections,
    rankedTopics: filterTopics(rankedTopics),
  }
}

const summarizeItems = async (
  rankedCandidates: RankedItem[]
): Promise<RankedItem[]> => {
  console.time('summarizeItems')
  // const llm = new OpenAI({
  //   modelName: 'gpt-4-0125-preview',
  //   configuration: {
  //     apiKey: process.env.OPENAI_API_KEY,
  //   },
  // })

  const llm = new ChatAnthropic({
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-3-sonnet-20240229',
  })

  const contextualTemplate = ChatPromptTemplate.fromTemplate(
    digestDefinition.summaryPrompt
  )

  // // send all the ranked candidates to openAI at once in a batch
  // const summaries = await chain.batch(
  //   rankedCandidates.map((item) => ({
  //     title: item.libraryItem.title,
  //     author: item.libraryItem.author ?? '',
  //     content: item.libraryItem.readableContent, // markdown content
  //   }))
  // )

  const summaries = await Promise.all(
    rankedCandidates.map(async (item) => {
      try {
        const prompt = await contextualTemplate.format({
          title: item.libraryItem.title,
          author: item.libraryItem.author ?? '',
          content: item.libraryItem.readableContent, // markdown content
        })

        return llm.invoke(prompt)
      } catch (error) {
        logger.error('summarizeItems error', error)
        return { content: '' }
      }
    })
  )

  summaries.forEach(
    (summary, index) =>
      (rankedCandidates[index].summary = summary.content.toString())
  )

  console.timeEnd('summarizeItems')

  return rankedCandidates
}

// generate speech files from the summaries
const generateSpeechFiles = (
  rankedItems: RankedItem[],
  options: SSMLOptions
): SpeechFile[] => {
  console.time('generateSpeechFiles')
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

  console.timeEnd('generateSpeechFiles')

  return speechFiles
}

// we should have a QA step here that does some
// basic checks to make sure the summaries are good.
const filterSummaries = (summaries: RankedItem[]): RankedItem[] => {
  return summaries.filter(
    (item) =>
      wordsCount(item.summary) > 100 &&
      wordsCount(item.summary) < 1000 &&
      item.summary.length < item.libraryItem.readableContent.length
  )
}

// we can use something more sophisticated to generate titles
const generateTitle = (summaries: RankedItem[]): string =>
  'Omnivore digest: ' +
  summaries.map((item) => item.libraryItem.title).join(', ')

// generate description based on the summaries
const generateDescription = (
  summaries: RankedItem[],
  rankedTopics: string[]
): string =>
  `We selected ${summaries.length} articles from your last 24 hours of saved items` +
  (rankedTopics.length ? `, covering ${rankedTopics.join(', ')}.` : '.')

// generate content based on the summaries
const generateContent = (summaries: RankedItem[]): string =>
  summaries
    .map((summary) => `### ${summary.libraryItem.title}\n ${summary.summary}`)
    .join('\n\n')

const generateByline = (summaries: RankedItem[]): string =>
  summaries
    .filter((summary) => !!summary.libraryItem.author)
    .map((item) => item.libraryItem.author)
    .join(', ')

export const createDigest = async (jobData: CreateDigestData) => {
  try {
    console.time('createDigestJob')

    digestDefinition = await fetchDigestDefinition()

    const candidates = await getCandidatesList(
      jobData.userId,
      jobData.libraryItemIds
    )
    if (candidates.length === 0) {
      logger.info('No candidates found')
      return writeDigest(jobData.userId, {
        id: jobData.id,
        jobState: TaskState.Succeeded,
        title: 'No articles found',
      })
    }

    // const userProfile = await findOrCreateUserProfile(jobData.userId)
    // const rankedCandidates = await rankCandidates(candidates, userProfile)
    // const { finalSelections, rankedTopics } =
    //   chooseRankedSelections(rankedCandidates)

    const selections = candidates.map((item) => ({
      topic: '',
      libraryItem: item,
      summary: '',
    }))
    const summaries = await summarizeItems(selections)
    logger.info('summaries: ', summaries)

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
      description: '',
      // description: generateDescription(summaries, rankedTopics),
      byline: generateByline(summaries),
      urlsToAudio: [],
    }

    await writeDigest(jobData.userId, digest)
  } catch (error) {
    logger.error('createDigestJob error', error)

    await writeDigest(jobData.userId, {
      id: jobData.id,
      jobState: TaskState.Failed,
    })
  } finally {
    // send notification
    const tokens = await findDeviceTokensByUserId(jobData.userId)
    if (tokens.length > 0) {
      const message = {
        notification: {
          title: 'Digest ready',
          body: 'Your digest is ready to listen',
        },
        tokens: tokens.map((token) => token.token),
      }

      await sendMulticastPushNotifications(jobData.userId, message, 'reminder')
    }

    console.timeEnd('createDigestJob')
  }
}
