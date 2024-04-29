package app.omnivore.omnivore.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Transaction
import app.omnivore.omnivore.core.database.entities.Highlight
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemAndHighlightCrossRef
import app.omnivore.omnivore.core.database.entities.SavedItemAndSavedItemLabelCrossRef
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights

@Dao
abstract class SavedItemWithLabelsAndHighlightsDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertSavedItems(items: List<SavedItem>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertLabelCrossRefs(items: List<SavedItemAndSavedItemLabelCrossRef>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertLabels(items: List<SavedItemLabel>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertHighlights(items: List<Highlight>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertHighlightCrossRefs(items: List<SavedItemAndHighlightCrossRef>)

    @Transaction
    open suspend fun insertAll(savedItems: List<SavedItemWithLabelsAndHighlights>) {
        insertSavedItems(savedItems.map { it.savedItem })

        val labels: MutableList<SavedItemLabel> = mutableListOf()
        val highlights: MutableList<Highlight> = mutableListOf()

        val labelCrossRefs: MutableList<SavedItemAndSavedItemLabelCrossRef> = mutableListOf()
        val highlightCrossRefs: MutableList<SavedItemAndHighlightCrossRef> = mutableListOf()

        for (searchItem in savedItems) {
            labels.addAll(searchItem.labels)
            highlights.addAll(searchItem.highlights)

            val newLabelCrossRefs = searchItem.labels.map {
                SavedItemAndSavedItemLabelCrossRef(
                    savedItemLabelId = it.savedItemLabelId,
                    savedItemId = searchItem.savedItem.savedItemId
                )
            }

            val newHighlightCrossRefs = searchItem.highlights.map {
                SavedItemAndHighlightCrossRef(
                    highlightId = it.highlightId,
                    savedItemId = searchItem.savedItem.savedItemId
                )
            }

            labelCrossRefs.addAll(newLabelCrossRefs)
            highlightCrossRefs.addAll(newHighlightCrossRefs)
        }

        insertLabels(labels)
        insertLabelCrossRefs(labelCrossRefs)

        insertHighlights(highlights)
        insertHighlightCrossRefs(highlightCrossRefs)
    }
}
