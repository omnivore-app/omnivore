import { logger } from '../utils/logger'
import { loadSummarizationChain } from 'langchain/chains'
import { ChatOpenAI } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { htmlToMarkdown } from '../utils/parser'
import { AISummary } from '../entity/AISummary'
import { LibraryItemState } from '../entity/library_item'

export interface AISummarizeJobData {
  userId: string
  promptId?: string
  libraryItemId: string
}

export const AI_SUMMARIZE_JOB_NAME = 'ai-summary-job'

export const aiSummarize = async (jobData: AISummarizeJobData) => {
  try {
    const libraryItem = await authTrx(
      async (tx) =>
        tx
          .withRepository(libraryItemRepository)
          .findById(jobData.libraryItemId),
      undefined,
      jobData.userId
    )
    if (libraryItem?.state !== LibraryItemState.Succeeded) {
      logger.info(
        `Not ready to summarize library item job state: ${libraryItem?.state}`
      )
      return
    }

    const llm = new ChatOpenAI({
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    })
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
    })

    const document = htmlToMarkdown(libraryItem.readableContent)
    const docs = await textSplitter.createDocuments([document])
    const chain = loadSummarizationChain(llm, {
      type: 'map_reduce', // you can choose from map_reduce, stuff or refine
      verbose: true, // to view the steps in the console
    })
    const response = await chain.call({
      input_documents: docs,
    })

    const summary = response.text
    console.log('SUMMARY: ', summary)

    const aiSummary = await authTrx(
      async (t) => {
        return t.getRepository(AISummary).save({
          user: { id: jobData.userId },
          libraryItem: { id: jobData.libraryItemId },
          title: libraryItem.title,
          slug: libraryItem.slug,
          summary: summary,
        })
      },
      undefined,
      jobData.userId
    )
  } catch (err) {
    console.log('error creating summary: ', err)
  }
}
