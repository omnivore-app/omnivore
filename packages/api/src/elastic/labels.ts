import { Label, PageContext } from './types'
import { client, INDEX_ALIAS } from './index'

export const addLabelInPage = async (
  id: string,
  label: Label,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.update({
      index: INDEX_ALIAS,
      id,
      body: {
        script: {
          source: `if (ctx._source.labels == null) { 
                    ctx._source.labels = [params.label]
                  } else if (!ctx._source.labels.any(label -> label.name == params.label.name)) {
                    ctx._source.labels.add(params.label) 
                  } else { ctx.op = 'none' }`,
          lang: 'painless',
          params: {
            label: label,
          },
        },
      },
      refresh: ctx.refresh,
      retry_on_conflict: 3,
    })

    return body.result === 'updated'
  } catch (e) {
    console.error('failed to update a page in elastic', e)
    return false
  }
}

export const deleteLabelInPages = async (
  userId: string,
  label: string,
  ctx: PageContext
): Promise<void> => {
  try {
    await client.updateByQuery({
      index: INDEX_ALIAS,
      body: {
        script: {
          source:
            'ctx._source.labels.removeIf(label -> label.name == params.label)',
          lang: 'painless',
          params: {
            label: label,
          },
        },
        query: {
          bool: {
            filter: [
              {
                term: {
                  userId,
                },
              },
              {
                nested: {
                  path: 'labels',
                  query: {
                    term: {
                      'labels.name': label,
                    },
                  },
                },
              },
            ],
          },
        },
      },
      refresh: ctx.refresh,
    })
  } catch (e) {
    console.error('failed to delete a page in elastic', e)
  }
}
