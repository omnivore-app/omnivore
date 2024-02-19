package app.omnivore.omnivore.core.data.repository

import app.omnivore.omnivore.core.data.model.LibraryQuery
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import kotlinx.coroutines.flow.Flow

interface LibraryRepository  {

    fun getSavedItems(query: LibraryQuery): Flow<List<SavedItemWithLabelsAndHighlights>>

    suspend fun updateReadingProgress(
        itemId: String,
        readingProgressPercentage: Double,
        readingProgressAnchorIndex: Int
    )
}
