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
import { truncate } from 'lodash'
import { v4 as uuid } from 'uuid'
import yaml from 'yaml'
import { LibraryItem } from '../../entity/library_item'
import { User } from '../../entity/user'
import { env } from '../../env'
import { TaskState } from '../../generated/graphql'
import { redisDataSource } from '../../redis_data_source'
import { Chapter, Digest, writeDigest } from '../../services/digest'
import {
  findLibraryItemsByIds,
  getItemUrl,
  searchLibraryItems,
} from '../../services/library_item'
import { savePage } from '../../services/save_page'
import {
  findUserAndPersonalization,
  sendPushNotifications,
} from '../../services/user'
import { ANTHROPIC_MODEL, OPENAI_MODEL } from '../../utils/ai'
import { analytics } from '../../utils/analytics'
import { enqueueSendEmail } from '../../utils/createTask'
import { wordsCount } from '../../utils/helpers'
import { createThumbnailProxyUrl } from '../../utils/imageproxy'
import { logger } from '../../utils/logger'
import { htmlToMarkdown, markdownToHtml } from '../../utils/parser'
import { uploadToBucket } from '../../utils/uploads'
import { getImageSize, _findThumbnail } from '../find_thumbnail'

export type CreateDigestJobSchedule = 'daily' | 'weekly'

export interface CreateDigestData {
  id?: string
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
  model?: string
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

type Channel = 'push' | 'email' | 'library'

export const CREATE_DIGEST_JOB = 'create-digest'
export const CRON_PATTERNS = {
  // every day at 10:30 UTC
  daily: '30 10 * * *',
  // every Sunday at 10:30 UTC
  weekly: '30 10 * * 7',
}

const AUTHOR = 'Omnivore Digest'

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
  // use the queries from the digest definitions to lookup preferences
  // There should be a list of multiple queries we use. For now we can
  // hardcode these queries:
  // - query: "in:all is:unread saved:last24hrs sort:saved-desc wordsCount:>=500"
  //   count: 100
  //   reason: "most recent 100 items saved over 500 words

  if (selectedLibraryItemIds) {
    return findLibraryItemsByIds(selectedLibraryItemIds, userId, {
      select: ['id', 'title', 'readableContent', 'author', 'thumbnail'],
    })
  }

  // // get the existing candidate ids from cache
  // const key = `digest:${userId}:existingCandidateIds`
  // const existingCandidateIds = await redisDataSource.redisClient?.get(key)

  // logger.info('existingCandidateIds: ', { existingCandidateIds })

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
      (item, index, self) =>
        index === self.findIndex((t) => t.id === item.id) &&
        !item.title.startsWith(AUTHOR) // exclude the digest items
    )
    .map((item) => ({
      ...item,
      readableContent: htmlToMarkdown(item.readableContent),
    })) // convert the html content to markdown

  logger.info(
    'dedupedCandidates: ',
    dedupedCandidates.map((item) => item.title)
  )

  if (dedupedCandidates.length === 0) {
    logger.info('No new candidates found')

    // if (existingCandidateIds) {
    //   // reuse the existing candidates
    //   const existingIds = existingCandidateIds.split(',')
    //   return findLibraryItemsByIds(existingIds, userId)
    // }

    // return empty array if no existing candidates
    return []
  }

  const selectedCandidates = randomSelectCandidates(dedupedCandidates)

  logger.info(
    'selectedCandidates: ',
    selectedCandidates.map((item) => item.title)
  )

  // // store the ids in cache
  // const candidateIds = selectedCandidates.map((item) => item.id).join(',')
  // await redisDataSource.redisClient?.set(key, candidateIds)

  return selectedCandidates
}

// Takes a list of library items, and uses a prompt to generate
// a text representation of a user profile
const createUserProfile = async (
  preferences: LibraryItem[]
): Promise<string> => {
  const llm = new OpenAI({
    modelName: OPENAI_MODEL,
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
    modelName: OPENAI_MODEL,
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
  model: string,
  rankedCandidates: RankedItem[]
): Promise<RankedItem[]> => {
  const contextualTemplate = PromptTemplate.fromTemplate(
    digestDefinition.summaryPrompt
  )

  if (model === 'openai') {
    const llm = new OpenAI({
      modelName: OPENAI_MODEL,
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    })

    const chain = contextualTemplate.pipe(llm)

    // send all the ranked candidates to openAI at once in a batch
    const summaries = await chain.batch(
      rankedCandidates.map((item) => ({
        title: item.libraryItem.title,
        author: item.libraryItem.author ?? '',
        content: item.libraryItem.readableContent, // markdown content
      }))
    )

    logger.info('summaries: ', summaries)

    summaries.forEach(
      (summary, index) => (rankedCandidates[index].summary = summary)
    )

    return rankedCandidates
  }

  // use anthropic otherwise
  const llm = new ChatAnthropic({
    apiKey: process.env.CLAUDE_API_KEY,
    model: ANTHROPIC_MODEL,
  })

  const prompts = await Promise.all(
    rankedCandidates.map(async (item) => {
      try {
        return await contextualTemplate.format({
          title: item.libraryItem.title,
          author: item.libraryItem.author ?? '',
          content: item.libraryItem.readableContent, // markdown content
        })
      } catch (error) {
        logger.error('summarizeItems error', error)
        return ''
      }
    })
  )
  logger.info('prompts: ', prompts)

  const summaries = await llm.batch(prompts)
  logger.info('summaries: ', summaries)

  summaries.forEach(
    (summary, index) =>
      (rankedCandidates[index].summary = summary.content.toString())
  )

  return rankedCandidates
}

// generate speech files from the summaries
const generateSpeechFiles = (
  summariesInHtml: string[],
  options: SSMLOptions
): SpeechFile[] => {
  const speechFiles = summariesInHtml.map((summary) => {
    const html = `
      <div id="readability-content">
        <div id="readability-page-1">
          ${summary}
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
  summaries
    .map((item) => item.libraryItem.title.replace(/\|.*/, '').trim()) // remove the author
    .join(', ')

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

const selectModel = (model?: string): string => {
  switch (model) {
    case 'random':
      // randomly choose between openai and anthropic
      return ['anthropic', 'openai'][Math.floor(Math.random() * 2)]
    case 'anthropic':
      return 'anthropic'
    case 'openai':
    default:
      // default to openai
      return 'openai'
  }
}

const uploadSummary = async (
  userId: string,
  digest: Digest,
  summaries: RankedItem[]
) => {
  logger.info('uploading summaries to gcs')

  const filename = `digest/${userId}/${digest.id}.json`
  await uploadToBucket(
    filename,
    Buffer.from(
      JSON.stringify({
        model: digest.model,
        summaries: summaries.map((item) => ({
          title: item.libraryItem.title,
          summary: item.summary,
        })),
      })
    ),
    {
      contentType: 'application/json',
      public: false,
    }
  )

  logger.info('uploaded summaries to gcs')
}

const sendPushNotification = async (userId: string, digest: Digest) => {
  const notification = {
    title: AUTHOR,
    body: truncate(digest.title, { length: 100 }),
  }
  const data = {
    digestId: digest.id,
  }

  await sendPushNotifications(userId, notification, 'reminder', data)
}

const sendEmail = async (user: User, digest: Digest, channels: Channel[]) => {
  const title = `${AUTHOR} ${new Date().toLocaleDateString()}`
  const subTitle = truncate(digest.title, { length: 65 }).slice(
    AUTHOR.length + 1
  )
  const isInLibrary = channels.includes('library')

  const chapters = digest.chapters ?? []

  const html = `
    <div>
      <h2>${title}</h1>
      <h2>${subTitle}</h2>

        ${chapters
          .map(
            (chapter) => `
              <div>
                <a href="${chapter.url}"><h3>${chapter.title} (${chapter.wordCount} words)</h3></a>
                <div>
                  ${chapter.html}
                </div>
              </div>`
          )
          .join('')}

      ${
        isInLibrary
          ? `<button style="background-color: #FFEAA0;
                    border: 0px solid transparent;
                    padding:15px 32px;
                    font-size: 14px;
                    margin: 20px 0;
                    font-family: Inter, sans-serif;
                    border-radius: 5px;">
              <a href="${env.client.url}/digest/${digest.id}">Read in Omnivore</a>
            </button>`
          : ''
      }

      <button style="
          font-size: 14px;
          margin: 20px 0;
          border: 0px solid transparent;
          padding: 15px 32px;
          font-size: 14px;
          margin: 20px 0;
          font-family: Inter, sans-serif;
          border-radius: 5px;
      ">
        <a href="${
          env.client.url
        }/settings/account">Update digest preferences</a>
      </button>
    </div>`

  await enqueueSendEmail({
    to: user.email,
    from: env.sender.message,
    subject: subTitle,
    html,
  })
}

const findThumbnail = async (
  chapters: Chapter[]
): Promise<string | undefined> => {
  const thumbnails = chapters
    .filter((chapter) => !!chapter.thumbnail)
    .map((chapter) => chapter.thumbnail as string)
    // randomly sort the thumbnails
    .sort(() => 0.5 - Math.random())

  try {
    for (const thumbnail of thumbnails) {
      const proxyUrl = createThumbnailProxyUrl(thumbnail)
      // pre-cache thumbnail first if exists
      const size = await getImageSize(proxyUrl)
      if (!size) {
        continue
      }

      const selectedThumbnail = _findThumbnail([size])
      if (selectedThumbnail) {
        return selectedThumbnail
      }
    }
  } catch {
    logger.error('findThumbnail error')
  }

  return undefined
}

export const moveDigestToLibrary = async (user: User, digest: Digest) => {
  const subTitle = digest.title?.slice(AUTHOR.length + 1) ?? ''
  const title = `${AUTHOR}: ${subTitle}`

  const chapters = digest.chapters ?? []

  const html = `
    <html>
      <body>
        <div class="_omnivore_digest">
            ${chapters
              .map(
                (chapter) => `
                  <div>
                    <a href="${chapter.url}"><h3>${chapter.title} (${chapter.wordCount} words)</h3></a>
                    <div>
                      ${chapter.html}
                    </div>
                  </div>`
              )
              .join('')}
        </div>
      </body>
    </html>`

  const previewImage = await findThumbnail(chapters)

  await savePage(
    {
      url: `${env.client.url}/omnivore-digest/${digest.id}`,
      title,
      originalContent: html,
      clientRequestId: digest.id,
      source: 'digest',
      author: AUTHOR,
      publishedAt: new Date(),
      previewImage,
      labels: [{ name: 'Digest', color: '#767AF8' }],
    },
    user
  )
}

const sendToChannels = async (
  user: User,
  digest: Digest,
  channels: Channel[] = ['push'] // default to push notification
) => {
  const deduplicateChannels = [...new Set(channels)]

  await Promise.all(
    deduplicateChannels.map(async (channel) => {
      switch (channel) {
        case 'push':
          await sendPushNotification(user.id, digest)
          break
        case 'email':
          await sendEmail(user, digest, deduplicateChannels)
          break
        case 'library':
          await moveDigestToLibrary(user, digest)
          break
        default:
          logger.error('Unknown channel', { channel })
          return
      }

      analytics.capture({
        distinctId: user.id,
        event: 'digest_created',
        properties: {
          channel,
          digestId: digest.id,
        },
      })
    })
  )
}

export const createDigest = async (jobData: CreateDigestData) => {
  // generate a unique id for the digest if not provided for scheduled jobs
  const digestId = jobData.id ?? uuid()

  try {
    const user = await findUserAndPersonalization(jobData.userId)
    if (!user) {
      logger.error('User not found', { userId: jobData.userId })
      return await writeDigest(jobData.userId, {
        id: digestId,
        jobState: TaskState.Failed,
        title: 'User not found',
      })
    }

    const personalization = user.userPersonalization
    if (!personalization) {
      logger.info('User personalization not found')
    }

    const config = personalization
      ? (personalization.digestConfig as {
          model?: string
          channels?: Channel[]
        })
      : undefined

    digestDefinition = await fetchDigestDefinition()
    const model = selectModel(config?.model || digestDefinition.model)
    logger.info(`model: ${model}`)

    const candidates = await getCandidatesList(
      jobData.userId,
      jobData.libraryItemIds
    )
    if (candidates.length === 0) {
      logger.info('No candidates found')
      return await writeDigest(jobData.userId, {
        id: digestId,
        jobState: TaskState.Failed,
        title: 'No candidates found',
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
    const summaries = await summarizeItems(model, selections)

    const filteredSummaries = filterSummaries(summaries)
    const summariesInHtml = filteredSummaries.map((item) => {
      try {
        return markdownToHtml(item.summary)
      } catch (error) {
        logger.error('markdownToHtml error', error)
        return ''
      }
    })

    const speechFiles = generateSpeechFiles(summariesInHtml, {
      ...jobData,
      primaryVoice: jobData.voices?.[0],
      secondaryVoice: jobData.voices?.[1],
    })
    const title = generateTitle(filteredSummaries)
    const digest = {
      id: digestId,
      title,
      content: generateContent(filteredSummaries),
      jobState: TaskState.Succeeded,
      speechFiles,
      chapters: filteredSummaries.map((item, index) => ({
        title: item.libraryItem.title,
        id: item.libraryItem.id,
        url: getItemUrl(item.libraryItem.id),
        thumbnail: item.libraryItem.thumbnail
          ? createThumbnailProxyUrl(item.libraryItem.thumbnail)
          : undefined,
        wordCount: speechFiles[index].wordCount,
        html: summariesInHtml[index],
        author: item.libraryItem.author ?? undefined,
      })),
      createdAt: new Date(),
      description: '',
      // description: generateDescription(filteredSummaries, rankedTopics),
      byline: generateByline(filteredSummaries),
      urlsToAudio: [],
      model,
    }

    await Promise.all([
      // write the digest to redis
      writeDigest(jobData.userId, digest),
      // upload the summaries to GCS
      uploadSummary(jobData.userId, digest, filteredSummaries).catch((error) =>
        logger.error('uploadSummary error', error)
      ),
    ])

    logger.info(`digest created: ${digest.id}`)

    // send notifications when digest is created
    await sendToChannels(user, digest, config?.channels)
  } catch (error) {
    logger.error('createDigestJob error', error)

    await writeDigest(jobData.userId, {
      id: digestId,
      jobState: TaskState.Failed,
      title: 'Failed to create digest',
    })
  }
}
