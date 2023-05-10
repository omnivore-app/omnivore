package app.omnivore.omnivore.ui.save

import android.content.ContentValues
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.Constants
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.graphql.generated.SaveUrlMutation
import app.omnivore.omnivore.graphql.generated.type.SaveUrlInput
import com.apollographql.apollo3.ApolloClient
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.util.*
import javax.inject.Inject

@HiltViewModel
class SaveViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  var isLoading by mutableStateOf(false)
    private set

  var message by mutableStateOf<String?>(null)
    private set

  var clientRequestID by mutableStateOf<String?>(null)
    private set

  private fun getAuthToken(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthToken)
  }

  fun cleanUrl(url: String): String? {
    return Regex("https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)")
      .findAll(url).map { it.value }.first()
  }

  fun saveURL(url: String) {
    viewModelScope.launch {
      isLoading = true
      message = "Saving to Omnivore..."

      val authToken = getAuthToken()

      if (authToken == null) {
        message = "You are not logged in. Please login before saving."
        isLoading = false
        return@launch
      }

      val apolloClient = ApolloClient.Builder()
        .serverUrl("${Constants.apiURL}/api/graphql")
        .addHttpHeader("Authorization", value = authToken)
        .build()

      // Attempt to parse the URL out of the text, if that fails send the text
      val cleanedUrl = cleanUrl(url) ?: url

      try {
        clientRequestID = UUID.randomUUID().toString()

        val response = apolloClient.mutation(
          SaveUrlMutation(
            SaveUrlInput(
              clientRequestId = clientRequestID!!,
              source = "android",
              url = cleanedUrl
            )
          )
        ).execute()

        isLoading = false

        val success = (response.data?.saveUrl?.onSaveSuccess?.url != null)
        message = if (success) {
          "Page Saved"
        } else {
          "There was an error saving your page"
        }

        Log.d(ContentValues.TAG, "Saved URL?: $success")
      } catch (e: java.lang.Exception) {
        message = "There was an error saving your page"
      }
    }
  }
}
