import { GoogleVertexAIEmbeddings } from '@langchain/community/embeddings/googlevertexai'
import { LibraryItem } from '../../entity/library_item'
import {
  findLibraryItemById,
  updateLibraryItem,
} from '../../services/library_item'
import { htmlToMarkdown } from '../../utils/parser'

export const UDPATE_EMBEDDING_JOB_NAME = 'update-embedding'

export interface UpdateEmbeddingJobData {
  libraryItemId: string
  userId: string
}

const getText = (libraryItem: LibraryItem) => {
  const markdown = htmlToMarkdown(libraryItem.readableContent)
  return `${libraryItem.title}\n${markdown}`
}

const getEmbedding = async (text: string): Promise<number[]> => {
  const model = new GoogleVertexAIEmbeddings()
  return model.embedQuery(text)
}

export const updateEmbedding = async (data: UpdateEmbeddingJobData) => {
  const { libraryItemId, userId } = data
  const libraryItem = await findLibraryItemById(libraryItemId, userId, {
    fields: ['id', 'title', 'readableContent'],
  })

  if (!libraryItem) {
    throw new Error(`Library item not found: ${libraryItemId}`)
  }

  const text = getText(libraryItem)

  const embedding = await getEmbedding(text)
  if (embedding.length === 0) {
    throw new Error(
      `Failed to get embedding for library item: ${libraryItemId}`
    )
  }

  await updateLibraryItem(
    libraryItemId,
    { embedding: JSON.stringify(embedding) },
    userId,
    undefined,
    true
  )
}
