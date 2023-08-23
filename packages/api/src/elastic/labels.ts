import { errors } from '@elastic/elasticsearch'
import { EntityType } from '../pubsub'
import { client, INDEX_ALIAS, logger } from './index'
import { Label, PageContext } from './types'

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
      e instanceof errors.ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      logger.info('page has been deleted', pageId)
      return false
    }
    logger.error('failed to add a label in elastic', e)
    return false
  }
}

export const updateLabelsInPage = async (
  pageId: string,
  labels: Label[],
  ctx: PageContext,
  labelsToAdd?: Label[]
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

    if (body.result === 'noop') return true
    if (body.result !== 'updated') return false
    if (labelsToAdd) {
      // publish labels to be added
      await Promise.all(
        labelsToAdd.map((label) =>
          ctx.pubsub.entityCreated<Label & { pageId: string }>(
            EntityType.LABEL,
            { pageId, ...label },
            ctx.uid
          )
        )
      )
    }

    return true
  } catch (e) {
    if (
      e instanceof errors.ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      logger.info('page has been deleted', pageId)
      return false
    }
    logger.error('failed to update labels in elastic', e)
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
          source: `if (ctx._source.highlights != null) {
                     for (h in ctx._source.highlights) {
                        if (h.labels != null) {
                          h.labels.removeIf(l -> l.name == params.label)
                        }
                     }
                   }
                   if (ctx._source.labels != null) {
                     ctx._source.labels.removeIf(label -> label.name == params.label);
                   }`,
          lang: 'painless',
          params: {
            label: label,
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
    logger.error('failed to delete a label in elastic', e)
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
                      for (l in ctx._source.labels) {
                        if (l.id == params.label.id) {
                          l.name = params.label.name;
                          l.color = params.label.color;
                          l.description = params.description;
                        } 
                      }
                   }
                   if (ctx._source.highlights != null) {
                     for (h in ctx._source.highlights) {
                        if (h.labels != null) {
                          for (l in h.labels) {
                            if (l.id == params.label.id) {
                              l.name = params.label.name;
                              l.color = params.label.color;
                              l.description = params.description;
                            }
                          }
                        }
                      }
                   }`,
          lang: 'painless',
          params: {
            label: label,
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
      requests_per_second: 500, // throttle the requests
      slices: 'auto', // parallelize the requests
    })

    body.updated > 0 &&
      (await ctx.pubsub.entityUpdated(EntityType.LABEL, label, ctx.uid))

    return true
  } catch (e) {
    logger.error('failed to update label in elastic', e)

    return false
  }
}

export const setLabelsForHighlight = async (
  highlightId: string,
  labels: Label[],
  ctx: PageContext,
  labelsToAdd?: Label[]
): Promise<boolean> => {
  try {
    const { body } = await client.updateByQuery({
      index: INDEX_ALIAS,
      body: {
        script: {
          source: `ctx._source.highlights.find(h -> params.highlightId == h.id).labels = params.labels;
                   ctx._source.updatedAt = params.updatedAt`,
          lang: 'painless',
          params: {
            highlightId,
            labels,
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

    if (labelsToAdd) {
      // publish labels to be added
      await Promise.all(
        labelsToAdd.map((label) =>
          ctx.pubsub.entityCreated<Label & { highlightId: string }>(
            EntityType.LABEL,
            { highlightId, ...label },
            ctx.uid
          )
        )
      )
    }

    return true
  } catch (e) {
    if (
      e instanceof errors.ResponseError &&
      e.message === 'document_missing_exception'
    ) {
      logger.info('highlight has been deleted', highlightId)
      return false
    }
    logger.error('failed to set labels for highlight in elastic', e)
    return false
  }
}
