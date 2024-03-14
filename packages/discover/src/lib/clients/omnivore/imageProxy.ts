import { pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import { EmbeddedOmnivoreArticle } from '../../ai/embedding'
import { env } from '../../../env'
import { createImageProxyUrl } from '../../utils/imageproxy'
import { onErrorContinue } from '../../utils/reactive'

export const addImageToProxy = (imageUrl: string): string => {
  // For testing purposes, really.
  if (env.imageProxy.url) {
    return createImageProxyUrl(imageUrl)
  }
  return imageUrl
}

export const putImageInProxy$ = pipe(
  onErrorContinue(
    map((it: EmbeddedOmnivoreArticle, _idx: number) => {
      return {
        ...it,
        article: {
          ...it.article,
          image: it.article.image && addImageToProxy(it.article.image),
        },
      }
    })
  )
)
