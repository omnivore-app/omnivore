import { DeepPartial } from 'typeorm'
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

    createAndSave(highlight: DeepPartial<Highlight>, userId: string) {
      return this.save({
        ...unescapeHighlight(highlight),
        user: { id: userId },
      })
    },
  })
