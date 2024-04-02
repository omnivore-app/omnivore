import { logger } from '../utils/logger'
import { loadSummarizationChain } from 'langchain/chains'
import { ChatOpenAI } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { htmlToMarkdown } from '../utils/parser'
import { AITaskRequest, AITaskResult } from '../entity/ai_tasks'
import { LibraryItemState } from '../entity/library_item'
import { getAIResult } from '../services/ai-summaries'

export interface AITaskJobData {
  userId: string
  requestId: string
}

export const AI_TASK_JOB_NAME = 'ai-task-job'

export const performAITask = async (jobData: AITaskJobData) => {
  try {
    const aiTaskRequest = await authTrx(
      async (t) => {
        return await t.getRepository(AITaskRequest).findOne({
          where: {
            id: jobData.requestId,
            user: { id: jobData.userId },
          },
          relations: {
            user: true,
            prompt: true,
            libraryItem: true,
          },
        })
      },
      undefined,
      jobData.userId
    )
    if (!aiTaskRequest) {
      logger.error('AITask job could not find ai_task_request', { jobData })
      return
    }

    console.log('got aiTaskRequest', aiTaskRequest)

    // if (!libraryItem || libraryItem.state !== LibraryItemState.Succeeded) {
    //   logger.info(
    //     `Not ready to summarize library item job state: ${
    //       libraryItem?.state ?? 'null'
    //     }`
    //   )
    //   return
    // }
    // const existingSummary = await getAIResult({
    //   userId: jobData.userId,
    //   idx: 'latest',
    //   libraryItemId: jobData.libraryItemId,
    // })
    // if (existingSummary) {
    //   logger.info(
    //     `Library item already has a summary: ${jobData.libraryItemId}`
    //   )
    //   return
    // }
    const llm = new ChatOpenAI({
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    })
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
    })
    const document = htmlToMarkdown(aiTaskRequest.libraryItem.readableContent)
    console.log('will summarize document: ', document)

    const docs = await textSplitter.createDocuments([document])
    const chain = loadSummarizationChain(llm, {
      type: 'map_reduce', // you can choose from map_reduce, stuff or refine
      verbose: true, // to view the steps in the console
    })
    const response = await chain.call({
      input_documents: docs,
    })
    if (typeof response.text !== 'string') {
      logger.error(`AI summary did not return text`)
      return
    }
    const summary = response.text
    const _ = await authTrx(
      async (t) => {
        return t.getRepository(AITaskResult).save({
          request: aiTaskRequest,
          user: { id: jobData.userId },
          libraryItem: aiTaskRequest?.libraryItem,
          resultText: summary,
        })
      },
      undefined,
      jobData.userId
    )
  } catch (err) {
    console.log('error creating summary: ', err)
  }
}
