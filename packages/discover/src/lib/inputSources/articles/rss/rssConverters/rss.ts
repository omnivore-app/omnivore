import { fromArrayLike } from 'rxjs/internal/observable/innerFrom'
import { mapOrNull } from '../../../../utils/reactive'
import { OmnivoreFeed } from '../../../../../types/Feeds'
import { getSiteConverter } from './sites/siteConverters'

export const parseRss = (feed: OmnivoreFeed) => (parsedXml: any) => {
  return fromArrayLike(parsedXml).pipe(
    mapOrNull(async (article: any) =>
      getSiteConverter('rss', feed)(feed, article)
    )
  )
}
