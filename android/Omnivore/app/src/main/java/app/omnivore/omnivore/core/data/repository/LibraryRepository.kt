package app.omnivore.omnivore.core.data.repository

import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.data.model.LibraryQuery
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class LibraryRepository @Inject constructor(
    private val dataService: DataService,
) {
    fun getSavedItems(query: LibraryQuery): Flow<List<SavedItemWithLabelsAndHighlights>> =
        dataService.db.savedItemDao().filteredLibraryData(
            query.allowedArchiveStates,
            query.sortKey,
            query.requiredLabels,
            query.excludedLabels,
            query.allowedContentReaders
        )

}
