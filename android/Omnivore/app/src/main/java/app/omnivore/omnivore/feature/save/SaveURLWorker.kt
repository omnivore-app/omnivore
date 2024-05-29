package app.omnivore.omnivore.feature.save

import android.content.Context
import androidx.compose.ui.text.intl.Locale
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
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

    override suspend fun doWork(): Result {
        return withContext(Dispatchers.IO){
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


}
