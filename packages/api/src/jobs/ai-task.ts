import { logger } from '../utils/logger'
import { BaseLanguageModel } from '@langchain/core/language_models/base'
import { loadSummarizationChain } from 'langchain/chains'
import { ChatOpenAI, OpenAI } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { htmlToMarkdown } from '../utils/parser'
import { PromptTemplate } from '@langchain/core/prompts'
import { AITaskRequest, AITaskResult, Prompt } from '../entity/ai_tasks'

export interface AITaskJobData {
  userId: string
  requestId: string
}

export const AI_TASK_JOB_NAME = 'ai-task-job'

const modelForPrompt = (prompt: Prompt): BaseLanguageModel => {
  // For now just use the OpenAI model
  return new OpenAI({
    modelName: 'gpt-4-0125-preview',
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  })
}

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

    const document = htmlToMarkdown(aiTaskRequest.libraryItem.readableContent)

    const llm = modelForPrompt(aiTaskRequest.prompt)
    const promptTemplate = PromptTemplate.fromTemplate(
      aiTaskRequest.prompt.template
    )

    const formattedTemplate = await promptTemplate.format({
      document: document,
      text: aiTaskRequest.extraText,
      title: aiTaskRequest.libraryItem.title,
    })
    console.log('executing formatted template: ', formattedTemplate)

    const chain = promptTemplate.pipe(llm)
    const result = await chain.invoke({
      document: document,
      text: aiTaskRequest.extraText,
      // title: aiTaskRequest.libraryItem.title,
    })

    console.log('RESULT: ', result)

    if (typeof result !== 'string') {
      logger.error(`AI summary did not return text`)
      return
    }
    const summary = result
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
