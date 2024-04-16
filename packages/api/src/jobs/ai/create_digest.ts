import { logger } from '../../utils/logger'
import { v4 as uuid } from 'uuid'

import { OpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { LibraryItem } from '../../entity/library_item'
import { CreateDigestJobData } from '../../services/digest'
import { htmlToSsmlItems } from '@omnivore/text-to-speech-handler'

const USER_PROFILE_PROMPT =
  'Create a user profile based on the supplied titles\n\ntitles:\n{titles}'

const SUMMARIZE_PROMPT =
  'Summarize the supplied article.\n\ntitle: {title}\nauthor: {author}\ncontent: {content}'

// TODO: Makes multiple DB queries and combines the results
const getPreferencesList = (userId: string): Promise<LibraryItem[]> => {
  // use the queries from the digest definitions to lookup preferences
  // There should be a list of multiple queries we use. For now we can
  // hardcode these queries:
  // - query: "in:all is:read OR has:highlights sort:updated-desc wordsCount:>=20"
  //   count: 21
  //   reason: "recently read or highlighted items that are not part of the digest"
  // - query: "in:all is:read OR has:highlights sort:saved-asc wordsCount:>=20"
  //   count: 4
  //   reason: "some older items that were interacted with"
  return Promise.resolve([])
}

// TODO: Makes multiple DB queries and combines the results
const getCandidatesList = (userId: string): Promise<LibraryItem[]> => {
  // use the queries from the digest definitions to lookup preferences
  // There should be a list of multiple queries we use. For now we can
  // hardcode these queries:
  // - query: "in:all is:unread saved:last24hrs sort:saved-desc wordsCount:>=500"
  //   count: 100
  //   reason: "most recent 100 items saved over 500 words
  return Promise.resolve([])
}

// TODO: Takes a list of library items, and uses a prompt to generate
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

  const contextualTemplate = PromptTemplate.fromTemplate(USER_PROFILE_PROMPT)

  const chain = contextualTemplate.pipe(llm)
  const result = await chain.invoke({
    titles: preferences.map((item) => `* ${item}`).join('\n'),
  })

  return result
}

// TODO: Checks redis for a user profile, if not found creates one and writes
// it to redis
const findOrCreateUserProfile = async (userId: string): Promise<string> => {
  // check redis for user profile, return if found
  // if not found
  const preferences = await getPreferencesList(userId)
  const profile = await createUserProfile(preferences)
  // TODO: write to redis here
  return profile
}

type RankedItem = {
  topic: string
  summary?: string
  libraryItem: LibraryItem
}

// TODO: Uses OpenAI to rank all the titles based on the user profiles
const rankCandidates = async (
  candidates: LibraryItem[],
  userProfile: string
): Promise<RankedItem[]> => {
  return Promise.resolve([])
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

  console.log('rankedTopics: ', rankedTopics)
  console.log('finalSelections: ', selected)

  const finalSelections = []

  for (const topic of rankedTopics) {
    const matches = selected.filter((item) => item.topic == topic)
    finalSelections.push(...matches)
  }

  console.log('finalSelections: ', finalSelections)

  return finalSelections
}

// TODO: we could paralleize this step sending all the ranked candidates to openAI at once
const summarizeItems = async (
  rankedCandidates: RankedItem[]
): Promise<RankedItem[]> => {
  const llm = new OpenAI({
    modelName: 'gpt-4-0125-preview',
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  })

  for (const item of rankedCandidates) {
    const contextualTemplate = PromptTemplate.fromTemplate(SUMMARIZE_PROMPT)

    const chain = contextualTemplate.pipe(llm)
    const summary = await chain.invoke({
      title: item.libraryItem.title,
      author: item.libraryItem.author ?? '',
      content: item.libraryItem.readableContent, // markdown content
    })
    item.summary = summary
  }

  return rankedCandidates
}

// TODO: we can use something more sophisticated to generate titles
const generateTitle = (selections: RankedItem[]): Promise<string> => {
  return Promise.resolve(
    'Omnivore digest: ' +
      selections.map((item) => item.libraryItem.title).join(',')
  )
}

// TODO: write the digest to redis here
// export interface Digest {
//   jobState: string

//   url?: string
//   title?: string
//   content?: string
//   chapters?: Chapter[]

//   urlsToAudio?: string[]
//   speechFiles?: SpeechFile[]
// }
// export interface SpeechFile {
//  wordCount: number;
//  language: string;
//  defaultVoice: string;
//  utterances: Utterance[];
//}
const writeDigest = async (userId: string, selections: RankedItem[]) => {
  const title = await generateTitle(selections)
  const speechFiles = selections.map((selection) => {
    // convert the summary item to a SpeechFile here
    return {
      wordCount: 0,
      language: 'en',
      defaultVoice: 'Josh',
      utterances: [],
    }
  })
  const digest = {
    id: uuid(),
    title: title,
    content: 'content',
    urlsToAudio: [],
    jobState: 'completed',
    speechFiles: speechFiles,
  }
  // write to redis
}

export const CreateDigestJob = async (jobData: CreateDigestJobData) => {
  try {
    const candidates = await getCandidatesList(jobData.userId)
    const userProfile = await findOrCreateUserProfile(jobData.userId)
    const rankedCandidates = await rankCandidates(candidates, userProfile)
    const selections = chooseRankedSelections(rankedCandidates)

    const summaries = await summarizeItems(selections)

    // TODO: we should have a QA step here that does some
    // basic checks to make sure the summaries are good.

    await writeDigest(jobData.userId, summaries)
  } catch (err) {
    console.log('error creating digest: ', err)
  }
}
