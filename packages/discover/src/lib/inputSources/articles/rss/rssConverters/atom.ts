import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'
import { mapOrNull } from '../../../../utils/reactive'
import { OmnivoreFeed } from '../../../../../types/Feeds'
import { getSiteConverter } from './sites/siteConverters'

export const convertAtomStream = (feed: OmnivoreFeed) => (parsedXml: any) => {
  return fromArrayLike(parsedXml.feed.entry).pipe(
    mapOrNull(async (article: any) =>
      getSiteConverter('atom', feed)(feed, article)
    )
  )
}
