package app.omnivore.omnivore.feature.library

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.ServiceInfo
import android.os.Build
import android.util.Log
import androidx.compose.ui.text.intl.Locale
import androidx.core.app.NotificationCompat
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.data.repository.LibraryRepository
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.libraryLastSyncTimestamp
import app.omnivore.omnivore.core.datastore.omnivoreAuthToken
import app.omnivore.omnivore.graphql.generated.SaveUrlMutation
import app.omnivore.omnivore.graphql.generated.type.SaveUrlInput
import app.omnivore.omnivore.utils.Constants
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.Optional
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.time.Instant
import java.util.TimeZone
import java.util.UUID
import java.util.regex.Pattern
@HiltWorker
class LibrarySyncWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val libraryRepository: LibraryRepository,
    private val datastoreRepository: DatastoreRepository,
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            withContext(Dispatchers.IO) {
                performItemSync()
                loadUsingSearchAPI()
                Log.d("LibrarySyncWorker", "Library sync completed successfully")
                Result.success()
            }
        } catch (e: Exception) {
            Log.e("LibrarySyncWorker", "Unexpected error in LibrarySyncWorker", e)
            Result.failure()
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
                Log.e("LibrarySyncWorker", "SYNC ERROR: $errorString")
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
