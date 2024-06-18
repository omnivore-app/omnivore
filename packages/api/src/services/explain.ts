import { PromptTemplate } from '@langchain/core/prompts'
import { OpenAI } from '@langchain/openai'
import { authTrx } from '../repository'
import { libraryItemRepository } from '../repository/library_item'
import { OPENAI_MODEL } from '../utils/ai'
import { htmlToMarkdown } from '../utils/parser'

export const explainText = async (
  userId: string,
  text: string,
  libraryItemId: string
): Promise<string> => {
  const llm = new OpenAI({
    modelName: OPENAI_MODEL,
    configuration: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  })

  const libraryItem = await authTrx(
    async (tx) =>
      tx.withRepository(libraryItemRepository).findById(libraryItemId),
    {
      uid: userId,
    }
  )

  if (!libraryItem) {
    throw 'No library item found'
  }

  const content = htmlToMarkdown(libraryItem.readableContent)

  const contextualTemplate = PromptTemplate.fromTemplate(
    `Create a brief, less than 300 character explanation of the provided
     term. Use the article text for additional context.

    Term: {text}

    Article text: {content}
    `
  )

  console.log('template: ', contextualTemplate)

  const chain = contextualTemplate.pipe(llm)
  const result = await chain.invoke({
    text: text,
    content,
  })
  console.log('result: ', result)

  return result
}
