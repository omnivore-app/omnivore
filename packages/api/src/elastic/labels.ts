import { Label, PageContext } from './types'
import { client, INDEX_ALIAS } from './index'
import { EntityType } from '../datalayer/pubsub'

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

    if (body.result !== 'updated') return false

    await ctx.pubsub.entityCreated<Label & { pageId: string }>(
      EntityType.LABEL,
      { pageId: id, ...label },
      ctx.uid
    )

    return true
  } catch (e) {
    console.error('failed to add a label in elastic', e)
    return false
  }
}

export const deleteLabelInPages = async (
  userId: string,
  label: string,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.updateByQuery({
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

    if (body.result !== 'updated') return false

    await ctx.pubsub.entityDeleted(EntityType.LABEL, label, ctx.uid)

    return true
  } catch (e) {
    console.error('failed to delete a label in elastic', e)
    return false
  }
}
