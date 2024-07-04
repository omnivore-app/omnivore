import { AISummary } from '../entity/AISummary'
import { authTrx } from '../repository'

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
    {
      uid: data.userId,
    }
  )
  return aiSummary ?? undefined
}
