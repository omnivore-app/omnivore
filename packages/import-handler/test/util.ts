import { Readability } from '@omnivore/readability'
import { ImportContext, RetrievedDataState } from '../src'

export const stubImportCtx = () => {
  return {
    userId: '',
    countImported: 0,
    countFailed: 0,
    urlHandler: (
      ctx: ImportContext,
      url: URL,
      state?: RetrievedDataState,
      labels?: string[]
    ): Promise<void> => {
      return Promise.resolve()
    },
    contentHandler: (
      ctx: ImportContext,
      url: URL,
      title: string,
      originalContent: string,
      parseResult: Readability.ParseResult
    ): Promise<void> => {
      return Promise.resolve()
    },
  }
}
