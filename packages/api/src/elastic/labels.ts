import { Label, PageContext } from './types'
import { client, INDEX_ALIAS } from './index'
import { EntityType } from '../datalayer/pubsub'
import { ResponseError } from '@elastic/elasticsearch/lib/errors'

export const addLabelInPage = async (
  pageId: string,
  label: Label,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.update({
      index: INDEX_ALIAS,
      id: pageId,
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
      { pageId, ...label },
      ctx.uid
    )

    return true
  } catch (e) {
    if (
      e instanceof ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      console.log('page has been deleted', pageId)
      return false
    }
    console.error('failed to add a label in elastic', e)
    return false
  }
}

export const updateLabelsInPage = async (
  pageId: string,
  labels: Label[],
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.update({
      index: INDEX_ALIAS,
      id: pageId,
      body: {
        doc: {
          labels: labels,
          updatedAt: new Date(),
        },
      },
      refresh: ctx.refresh,
      retry_on_conflict: 3,
    })

    if (body.result !== 'updated') return false

    for (const label of labels) {
      await ctx.pubsub.entityCreated<Label & { pageId: string }>(
        EntityType.LABEL,
        { pageId, ...label },
        ctx.uid
      )
    }

    return true
  } catch (e) {
    if (
      e instanceof ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      console.log('page has been deleted', pageId)
      return false
    }
    console.error('failed to update labels in elastic', e)
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

    if (body.updated === 0) return false

    await ctx.pubsub.entityDeleted(EntityType.LABEL, label, ctx.uid)

    return true
  } catch (e) {
    console.error('failed to delete a label in elastic', e)
    return false
  }
}
