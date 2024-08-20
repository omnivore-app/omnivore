import { authTrx } from '../repository'

export const UPDATE_LABELS_JOB = 'update-labels'
export const UPDATE_HIGHLIGHT_JOB = 'update-highlight'

export interface UpdateLabelsData {
  libraryItemId: string
  userId: string
}

export interface UpdateHighlightData {
  libraryItemId: string
  userId: string
}

export const updateLabels = async (data: UpdateLabelsData) => {
  return authTrx(
    async (tx) =>
      tx.query(
        `UPDATE omnivore.library_item
          SET label_names = COALESCE((
            SELECT array_agg(DISTINCT l.name)
            FROM omnivore.labels l
            INNER JOIN omnivore.entity_labels el
              ON el.label_id = l.id
              AND el.library_item_id = $1
          ), ARRAY[]::TEXT[])
          WHERE id = $1`,
        [data.libraryItemId]
      ),
    {
      uid: data.userId,
    }
  )
}

export const updateHighlight = async (data: UpdateHighlightData) => {
  return authTrx(
    async (tx) =>
      tx.query(
        `UPDATE omnivore.library_item
          SET highlight_annotations = COALESCE((
            SELECT array_agg(COALESCE(annotation, ''))
            FROM omnivore.highlight
            WHERE library_item_id = $1
          ), ARRAY[]::TEXT[])
          WHERE id = $1`,
        [data.libraryItemId]
      ),
    {
      uid: data.userId,
    }
  )
}
