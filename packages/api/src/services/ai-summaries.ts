import { AITaskResult } from '../entity/ai_tasks'
import { authTrx } from '../repository'

export const getAIResult = async (data: {
  userId: string
  idx: string
  libraryItemId: string
}): Promise<AITaskResult | undefined> => {
  // const aiSummary = await authTrx(
  //   async (t) => {
  //     const repo = t.getRepository(AITaskResult)
  //     if (data.idx == 'latest') {
  //       return repo.findOne({
  //         where: {
  //           user: { id: data.userId },
  //           libraryItem: { id: data.libraryItemId },
  //         },
  //         order: { generatedAt: 'DESC' },
  //       })
  //     } else {
  //       return repo.findOne({
  //         where: {
  //           id: data.idx,
  //           user: { id: data.userId },
  //           libraryItem: { id: data.libraryItemId },
  //         },
  //       })
  //     }
  //   },
  //   undefined,
  //   data.userId
  // )
  // return aiSummary ?? undefined
  // for linting
  await Promise.resolve()
  return undefined
}
