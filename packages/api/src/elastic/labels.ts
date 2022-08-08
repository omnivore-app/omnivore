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
                    ctx._source.labels = [params.label];
                    ctx._source.updatedAt = params.updatedAt
                  } else if (!ctx._source.labels.any(label -> label.name == params.label.name)) {
                    ctx._source.labels.add(params.label);
                    ctx._source.updatedAt = params.updatedAt
                  } else { ctx.op = 'none' }`,
          lang: 'painless',
          params: {
            label: label,
            updatedAt: new Date(),
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

export const deleteLabel = async (
  label: string,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.updateByQuery({
      index: INDEX_ALIAS,
      body: {
        script: {
          source: `if (ctx._source.highlights != null && ctx._source.highlights[0].labels != null) {
                     ctx._source.highlights[0].labels.removeIf(label -> label.name == params.label);
                     ctx._source.updatedAt = params.updatedAt
                   }
                   if (ctx._source.labels != null) {
                     ctx._source.labels.removeIf(label -> label.name == params.label);
                     ctx._source.updatedAt = params.updatedAt
                   }`,
          lang: 'painless',
          params: {
            label: label,
            updatedAt: new Date(),
          },
        },
        query: {
          bool: {
            must: {
              term: {
                userId: ctx.uid,
              },
            },
            should: [
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
              {
                nested: {
                  path: 'highlights',
                  query: {
                    nested: {
                      path: 'highlights.labels',
                      query: {
                        term: {
                          'highlights.labels.name': label,
                        },
                      },
                    },
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
      refresh: ctx.refresh,
      conflicts: 'proceed', // ignore conflicts
    })

    body.updated > 0 &&
      (await ctx.pubsub.entityDeleted(EntityType.LABEL, label, ctx.uid))

    return true
  } catch (e) {
    console.error('failed to delete a label in elastic', e)
    return false
  }
}

export const updateLabel = async (
  label: Label,
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.updateByQuery({
      index: INDEX_ALIAS,
      body: {
        script: {
          source: `if (ctx._source.labels != null) {
                     ctx._source.labels.removeIf(l -> l.id == params.label.id);
                     ctx._source.labels.add(params.label);
                     ctx._source.updatedAt = params.updatedAt
                   }
                   if (ctx._source.highlights != null) {
                     ctx._source.highlights[0].labels.removeIf(l -> l.id == params.label.id);
                     ctx._source.highlights[0].labels.add(params.label);
                     ctx._source.updatedAt = params.updatedAt
                   }`,
          lang: 'painless',
          params: {
            label: label,
            updatedAt: new Date(),
          },
        },
        query: {
          bool: {
            must: {
              term: {
                userId: ctx.uid,
              },
            },
            should: [
              {
                nested: {
                  path: 'labels',
                  query: {
                    term: {
                      'labels.id': label.id,
                    },
                  },
                },
              },
              {
                nested: {
                  path: 'highlights',
                  query: {
                    nested: {
                      path: 'highlights.labels',
                      query: {
                        term: {
                          'highlights.labels.id': label.id,
                        },
                      },
                    },
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      },
      refresh: ctx.refresh,
      conflicts: 'proceed', // ignore conflicts
    })

    body.updated > 0 &&
      (await ctx.pubsub.entityUpdated(EntityType.LABEL, label, ctx.uid))

    return true
  } catch (e) {
    console.error('failed to update label in elastic', e)

    return false
  }
}

export const setLabelsForHighlight = async (
  highlightId: string,
  labels: Label[],
  ctx: PageContext
): Promise<boolean> => {
  try {
    const { body } = await client.updateByQuery({
      index: INDEX_ALIAS,
      body: {
        script: {
          source: `ctx._source.highlights[0].labels = params.labels;
                   ctx._source.updatedAt = params.updatedAt`,
          lang: 'painless',
          params: {
            labels: labels,
            updatedAt: new Date(),
          },
        },
        query: {
          nested: {
            path: 'highlights',
            query: {
              term: {
                'highlights.id': highlightId,
              },
            },
          },
        },
      },
      refresh: ctx.refresh,
      conflicts: 'proceed', // ignore conflicts
    })

    if (!body.updated) {
      return false
    }

    for (const label of labels) {
      await ctx.pubsub.entityCreated<Label & { highlightId: string }>(
        EntityType.LABEL,
        { highlightId, ...label },
        ctx.uid
      )
    }

    return true
  } catch (e) {
    if (
      e instanceof ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      console.log('highlight has been deleted', highlightId)
      return false
    }
    console.error('failed to set labels for highlight in elastic', e)
    return false
  }
}
