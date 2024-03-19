import { ChatOpenAI } from '@langchain/openai'
import { AISummary } from '../entity/AISummary'
import { authTrx } from '../repository'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { loadSummarizationChain } from 'langchain/chains'
import { logger } from '../utils/logger'
import { NodeHtmlMarkdown, TranslatorConfigObject } from 'node-html-markdown'

// When creating markdown we remove external links in URLs
// and images since these often contain per-user trackers
// that can interfere with caching
const removeLinksTransformer: TranslatorConfigObject = {
  a: ({ node, options, visitor }) => {
    return {
      postprocess: ({ content }) => {
        return `[${content}]()`
      },
    }
  },
  img: ({ node, options, visitor }) => {
    const alt = node.getAttribute('alt')?.trim()
    return {
      content: `![${alt}]()`,
    }
  },
}

export const createSummarizableDocument = (readable: string): string => {
  const nhm = new NodeHtmlMarkdown(
    {
      keepDataImages: false,
    },
    removeLinksTransformer
  )
  return nhm.translate(readable)
}

export const createAISummary = async (
  readableContent: string
): Promise<string | undefined> => {
  const llm = new ChatOpenAI({
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  })
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 12000,
  })

  const document = createSummarizableDocument(readableContent)
  const docs = await textSplitter.createDocuments([document])
  const chain = loadSummarizationChain(llm, {
    type: 'map_reduce', // you can choose from map_reduce, stuff or refine
    verbose: true, // to view the steps in the console
  })
  const response = await chain.invoke({
    input_documents: docs,
  })

  console.log('summary response: ', JSON.stringify(response))

  if (typeof response.text !== 'string') {
    logger.error(`AI summary did not return text`)
    return
  }

  return response.text
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
