import { DeepPartial } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { appDataSource } from '../data_source'
import { Highlight } from '../entity/highlight'
import { unescapeHtml } from '../utils/helpers'

const unescapeHighlight = (highlight: DeepPartial<Highlight>) => {
  // unescape HTML entities
  if (highlight.annotation !== undefined && highlight.annotation !== null) {
    highlight.annotation = unescapeHtml(highlight.annotation.toString())
  }
  if (highlight.quote !== undefined && highlight.quote !== null) {
    highlight.quote = unescapeHtml(highlight.quote.toString())
  }

  return highlight
}

export const highlightRepository = appDataSource
  .getRepository(Highlight)
  .extend({
    findById(id: string) {
      return this.findOneBy({ id })
    },

    findByLibraryItemId(libraryItemId: string, userId: string) {
      return this.findBy({
        libraryItem: { id: libraryItemId },
        user: { id: userId },
      })
    },

    createAndSave(highlight: DeepPartial<Highlight>) {
      return this.save(unescapeHighlight(highlight))
    },

    createAndSaves(highlights: DeepPartial<Highlight>[]) {
      return this.save(highlights.map(unescapeHighlight))
    },

    updateAndSave(
      highlightId: string,
      highlight: QueryDeepPartialEntity<Highlight>
    ) {
      if (highlight.annotation !== undefined && highlight.annotation !== null) {
        highlight.annotation = unescapeHtml(highlight.annotation.toString())
      }
      if (highlight.quote !== undefined && highlight.quote !== null) {
        highlight.quote = unescapeHtml(highlight.quote.toString())
      }
      return this.update(highlightId, highlight)
    },
  })
