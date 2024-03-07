package app.omnivore.omnivore.core.data.repository.impl

import app.omnivore.omnivore.core.data.model.LibraryQuery
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.data.repository.LibraryRepository
import app.omnivore.omnivore.core.database.dao.SavedItemDao
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.ReadingProgressParams
import app.omnivore.omnivore.core.network.updateReadingProgress
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class LibraryRepositoryImpl @Inject constructor(
    private val savedItemDao: SavedItemDao,
    private val networker: Networker
): LibraryRepository {

    override fun getSavedItems(query: LibraryQuery): Flow<List<SavedItemWithLabelsAndHighlights>> =
        savedItemDao.filteredLibraryData(
            query.allowedArchiveStates,
            query.sortKey,
            hasRequiredLabels = query.requiredLabels.size,
            hasExcludedLabels = query.excludedLabels.size,
            query.requiredLabels,
            query.excludedLabels,
            query.allowedContentReaders
        )

    override suspend fun updateReadingProgress(
        itemId: String,
        readingProgressPercentage: Double,
        readingProgressAnchorIndex: Int
    ) {

        val jsonString = Gson().toJson(
            mapOf(
                "id" to itemId,
                "readingProgressPercent" to readingProgressPercentage,
                "readingProgressAnchorIndex" to readingProgressAnchorIndex,
                "force" to true
            )
        )

        val readingProgressParams = Gson().fromJson(jsonString, ReadingProgressParams::class.java)
        val savedItemId = readingProgressParams.id ?: return


        val savedItem = savedItemDao.findById(savedItemId)
        val updatedItem = savedItem?.copy(
            readingProgress = readingProgressParams.readingProgressPercent ?: 0.0,
            readingProgressAnchor = readingProgressParams.readingProgressAnchorIndex ?: 0,
            serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
        )

        updatedItem?.let { savedItemDao.update(updatedItem) }

        val isUpdatedOnServer = networker.updateReadingProgress(readingProgressParams)

        if (isUpdatedOnServer) {
            updatedItem?.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            updatedItem?.let { savedItemDao.update(updatedItem) }
        }
    }
}
