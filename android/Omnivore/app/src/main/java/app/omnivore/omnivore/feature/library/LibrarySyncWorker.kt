package app.omnivore.omnivore.feature.library

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import app.omnivore.omnivore.core.data.repository.LibraryRepository
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.libraryLastSyncTimestamp
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.time.Instant

@HiltWorker
class LibrarySyncWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val libraryRepository: LibraryRepository,
    private val datastoreRepository: DatastoreRepository,
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return withContext(Dispatchers.IO) {
            try {
                performItemSync()
                loadUsingSearchAPI()
                Result.success()
            } catch (e: Exception) {
                e.printStackTrace()
                Result.failure()
            }
        }
    }

    private suspend fun performItemSync(
        cursor: String? = null,
        since: String = getLastSyncTime()?.toString() ?: Instant.MIN.toString(),
        count: Int = 0,
        syncStart: String = Instant.now().toString(),
    ) {
        libraryRepository.syncOfflineItemsWithServerIfNeeded()

        val result = libraryRepository.sync(
            context = applicationContext,
            since = since,
            cursor = cursor,
            limit = 10
        )
        val totalCount = count + result.count

        if (result.hasError) {
            result.errorString?.let { errorString ->
                println("SYNC ERROR: $errorString")
            }
        }

        if (!result.hasError && result.hasMoreItems && result.cursor != null) {
            performItemSync(
                cursor = result.cursor,
                since = since,
                count = totalCount,
                syncStart = syncStart
            )
        } else {
            datastoreRepository.putString(libraryLastSyncTimestamp, syncStart)
        }
    }

    private suspend fun loadUsingSearchAPI() {
        val result = libraryRepository.librarySearch(
            context = applicationContext,
            cursor = null,
            query = "${SavedItemFilter.INBOX.queryString} ${SavedItemSortFilter.NEWEST.queryString}"
        )
        result.savedItems.map {
            val isSavedInDB =
                libraryRepository.isSavedItemContentStoredInDB(
                    applicationContext,
                    it.savedItem.slug
                )

            if (!isSavedInDB) {
                libraryRepository.fetchSavedItemContent(applicationContext, it.savedItem.slug)
            }
        }
    }

    private fun getLastSyncTime(): Instant? = runBlocking {
        datastoreRepository.getString(libraryLastSyncTimestamp)?.let {
            try {
                return@let Instant.parse(it)
            } catch (e: Exception) {
                return@let null
            }
        }
    }
}
