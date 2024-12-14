package app.omnivore.omnivore.feature.save

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
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.omnivoreAuthToken
import app.omnivore.omnivore.core.datastore.omnivoreSelfHostedApiServer
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

    override suspend fun doWork(): Result {
        return withContext(Dispatchers.IO) {
            try {
                val url = inputData.getString("url")
                if (url == null) {
                    Log.e("SaveURLWorker", "No URL provided")
                    return@withContext Result.failure()
                }

                if (saveURL(url)) {
                    Log.d("SaveURLWorker", "URL saved successfully")
                    Result.success()
                } else {
                    Log.e("SaveURLWorker", "Failed to save URL")
                    Result.failure()
                }
            } catch (e: Exception) {
                Log.e("SaveURLWorker", "Unexpected error in SaveURLWorker", e)
                Result.failure()
            }
        }
    }

    suspend fun baseUrl() =
        datastoreRepository.getString(omnivoreSelfHostedApiServer) ?: Constants.apiURL

    private suspend fun serverUrl() = "${baseUrl()}/api/graphql"

    private suspend fun saveURL(url: String): Boolean {
        val authToken = datastoreRepository.getString(omnivoreAuthToken) ?: return false

        val apolloClient = ApolloClient.Builder()
            .serverUrl(serverUrl())
            .addHttpHeader("Authorization", value = authToken)
            .build()

        val cleanedUrl = cleanUrl(url) ?: url

        return try {
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
            (response.data?.saveUrl?.onSaveSuccess?.url != null)
        } catch (e: Exception) {
            Log.e("SaveURLWorker", "Failed to save item", e)
            false
        }
    }

    private fun cleanUrl(text: String): String? {
        val pattern = Pattern.compile("\\b(?:https?|ftp)://\\S+")
        val matcher = pattern.matcher(text)

        return if (matcher.find()) {
            matcher.group()
        } else {
            null
        }
    }

    companion object {
        const val NOTIFICATION_CHANNEL_ID = "SAVE_URL_WORKER_CHANNEL"
        const val NOTIFICATION_CHANNEL_NAME = "URL Saver"
        const val NOTIFICATION_ID = 1
    }

    override suspend fun getForegroundInfo(): ForegroundInfo {
        val notification = createNotification()
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ForegroundInfo(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            ForegroundInfo(NOTIFICATION_ID, notification)
        }
    }

    private fun createNotification(): Notification {
        val channelId =
            createNotificationChannel()

        return NotificationCompat.Builder(applicationContext, channelId)
            .setContentTitle("Saving URL")
            .setContentText("Your URL is being saved in the background.")
            .setSmallIcon(R.drawable.ic_notification) // Ensure this icon is valid
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
    }

    private fun createNotificationChannel(): String {
        val channel = NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            NOTIFICATION_CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH // Changed from LOW to HIGH
        ).apply {
            description = "Notification channel for URL saving"
        }

        val notificationManager =
            applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)

        return NOTIFICATION_CHANNEL_ID
    }
}
