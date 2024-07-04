package app.omnivore.omnivore.feature.library

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
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
    override suspend fun getForegroundInfo(): ForegroundInfo {
        return ForegroundInfo(
            NOTIFICATION_ID,
            createNotification()
        )
    }

    companion object {
        const val NOTIFICATION_CHANNEL_ID = "LIBRARY_SYNC_WORKER_CHANNEL"
        const val NOTIFICATION_CHANNEL_NAME = "Sync library"
        const val NOTIFICATION_ID = 2
    }

    override suspend fun doWork(): Result {
        try {
            setForeground(createForegroundInfo())
        } catch (e: Exception) {
            e.printStackTrace()
            return Result.failure()
        }

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

    private fun createForegroundInfo(): ForegroundInfo {
        val notification = createNotification()
        return ForegroundInfo(NOTIFICATION_ID, notification)
    }

    private fun createNotification(): Notification {
        val channelId = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel()
        } else {
            ""
        }

        return NotificationCompat.Builder(applicationContext, channelId)
            .setContentTitle("Syncing library items")
            .setContentText("Your library is being synced")
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel(): String {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelName = NOTIFICATION_CHANNEL_NAME
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                channelName,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notification channel for library syncing"
            }

            val notificationManager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)

            return NOTIFICATION_CHANNEL_ID
        } else {
            return ""
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
