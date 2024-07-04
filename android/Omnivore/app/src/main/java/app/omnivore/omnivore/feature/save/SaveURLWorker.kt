package app.omnivore.omnivore.feature.save

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
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.omnivoreAuthToken
import app.omnivore.omnivore.graphql.generated.SaveUrlMutation
import app.omnivore.omnivore.graphql.generated.type.SaveUrlInput
import app.omnivore.omnivore.utils.Constants
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.Optional
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.TimeZone
import java.util.UUID
import java.util.regex.Pattern

@HiltWorker
class SaveURLWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val datastoreRepository: DatastoreRepository,
) : CoroutineWorker(appContext, workerParams) {
    override suspend fun getForegroundInfo(): ForegroundInfo {
        return ForegroundInfo(
            NOTIFICATION_ID,
            createNotification()
        )
    }

    companion object {
        const val NOTIFICATION_CHANNEL_ID = "SAVE_URL_WORKER_CHANNEL"
        const val NOTIFICATION_CHANNEL_NAME = "URL Saver"
        const val NOTIFICATION_ID = 1
    }

    override suspend fun doWork(): Result {
        try {
            setForeground(createForegroundInfo())
        } catch (e: Exception) {
            e.printStackTrace()
            return Result.failure()
        }

        return withContext(Dispatchers.IO) {
            val url = inputData.getString("url") ?: return@withContext Result.failure()
            if (saveURL(url)) Result.success() else Result.failure()
        }
    }

    private suspend fun saveURL(url: String): Boolean {
        val authToken = datastoreRepository.getString(omnivoreAuthToken) ?: return false

        val apolloClient = ApolloClient.Builder()
            .serverUrl("${Constants.apiURL}/api/graphql")
            .addHttpHeader("Authorization", value = authToken)
            .build()

        val cleanedUrl = cleanUrl(url) ?: url

        try {
            val timezone = TimeZone.getDefault().id
            val locale = Locale.current.toLanguageTag()

            val response = apolloClient.mutation(
                SaveUrlMutation(
                    SaveUrlInput(
                        clientRequestId = UUID.randomUUID().toString(),
                        source = "android",
                        url = cleanedUrl,
                        timezone = Optional.present(timezone),
                        locale = Optional.present(locale)
                    )
                )
            ).execute()
            return (response.data?.saveUrl?.onSaveSuccess?.url != null)
        } catch (e: Exception) {
            Log.d("omnivore", "FAILED TO SAVE ITEM")
            e.printStackTrace()
            return false
        }
    }

    private fun cleanUrl(text: String): String? {
        val pattern = Pattern.compile("\\b(?:https?|ftp)://\\S+")
        val matcher = pattern.matcher(text)

        if (matcher.find()) {
            return matcher.group()
        }
        return null
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
            .setContentTitle("Saving URL")
            .setContentText("Your URL is being saved in the background.")
            .setSmallIcon(R.drawable.ic_notification) // Ensure this icon is valid
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
                description = "Notification channel for URL saving"
            }

            val notificationManager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)

            return NOTIFICATION_CHANNEL_ID
        } else {
            return ""
        }
    }
}
