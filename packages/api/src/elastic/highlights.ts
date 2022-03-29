import { Highlight, PageContext } from './types'
import { ResponseError } from '@elastic/elasticsearch/lib/errors'
import { client, INDEX_ALIAS } from './index'

export const addHighlightToPage = async (
  id: string,
  highlight: Highlight,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.update({
      index: INDEX_ALIAS,
      id,
      body: {
        script: {
          source: `if (ctx._source.highlights == null) { 
                    ctx._source.highlights = [params.highlight]
                  } else {
                    ctx._source.highlights.add(params.highlight) 
                  }`,
          lang: 'painless',
          params: {
            highlight: highlight,
          },
        },
      },
      refresh: ctx.refresh,
      retry_on_conflict: 3,
    })

    return body.result === 'updated'
  } catch (e) {
    if (
      e instanceof ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      console.log('page has been deleted', id)
      return false
    }
    console.error('failed to add highlight to a page in elastic', e)
    return false
  }
}
