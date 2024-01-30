import { authTrx } from '../repository'

export const UPDATE_LABELS_IN_LIBRARY_ITEM_JOB = 'update-labels-in-library-item'

export interface UpdateLabelsInLibraryItemData {
  libraryItemId: string
  userId: string
}

export const updateLabelsInLibraryItem = async (
  data: UpdateLabelsInLibraryItemData
) => {
  return authTrx(
    async (tx) =>
      tx.query(
        `WITH labels_agg AS (
          SELECT array_agg(l.name) AS names_agg
          FROM omnivore.labels l
          INNER JOIN omnivore.entity_labels el ON el.label_id = l.id 
          LEFT JOIN omnivore.highlight h ON h.id = el.highlight_id 
          WHERE el.library_item_id = $1 OR h.library_item_id = $1
        )
        UPDATE omnivore.library_item li
        SET label_names = COALESCE((SELECT names_agg FROM labels_agg), ARRAY[]::TEXT[])
        WHERE li.id = $1;`,
        [data.libraryItemId]
      ),
    undefined,
    data.userId
  )
}
