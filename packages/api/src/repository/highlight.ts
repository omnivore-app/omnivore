import { DeepPartial } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { entityManager } from '.'
import { Highlight } from '../entity/highlight'
import { unescapeHtml } from '../utils/helpers'

const unescapeHighlight = (highlight: DeepPartial<Highlight>) => {
  // unescape HTML entities
  highlight.annotation = highlight.annotation
    ? unescapeHtml(highlight.annotation)
    : undefined
  highlight.quote = highlight.quote ? unescapeHtml(highlight.quote) : undefined

  return highlight
}

export const highlightRepository = entityManager
  .getRepository(Highlight)
  .extend({
    findById(id: string) {
      return this.findOneBy({ id })
    },

    findByLibraryItemId(libraryItemId: string) {
      return this.findBy({
        libraryItem: { id: libraryItemId },
      })
    },

    createAndSave(highlight: DeepPartial<Highlight>) {
      return this.save(unescapeHighlight(highlight))
    },

    updateAndSave(
      highlightId: string,
      highlight: QueryDeepPartialEntity<Highlight>
    ) {
      return this.update(highlightId, {
        ...highlight,
        annotation: highlight.annotation
          ? unescapeHtml(highlight.annotation.toString())
          : undefined,
        quote: highlight.quote
          ? unescapeHtml(highlight.quote.toString())
          : undefined,
      })
    },
  })
