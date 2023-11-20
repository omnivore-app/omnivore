import { Observable, ObservableInput, pipe } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'
import { EmbeddedOmnivoreArticle } from '../../ai/embedding'

export const addImageToProxy = async (imageUrl: string): Promise<string> => {
  // I don't know how to do this right now, but maybe I can get help.
  return imageUrl
}

export const putImageInProxy$ = pipe(
  mergeMap<EmbeddedOmnivoreArticle, ObservableInput<EmbeddedOmnivoreArticle>>(
    async (it: EmbeddedOmnivoreArticle, _idx: number) => {
      return {
        ...it,
        article: {
          ...it.article,
          image: it.article.image && (await addImageToProxy(it.article.image)),
        },
      }
    }
  )
)
