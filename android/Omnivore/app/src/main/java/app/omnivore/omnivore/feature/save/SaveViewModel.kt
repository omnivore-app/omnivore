package app.omnivore.omnivore.feature.save

import android.util.Patterns
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.text.intl.Locale
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.omnivoreAuthToken
import app.omnivore.omnivore.core.datastore.omnivoreSelfHostedApiServer
import app.omnivore.omnivore.graphql.generated.SaveUrlMutation
import app.omnivore.omnivore.graphql.generated.type.SaveUrlInput
import app.omnivore.omnivore.utils.Constants
import app.omnivore.omnivore.utils.ResourceProvider
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.Optional
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.util.TimeZone
import java.util.UUID
import java.util.regex.Pattern
import javax.inject.Inject

enum class SaveState {
  DEFAULT,
  SAVING,
  ERROR,
  SAVED
}

@HiltViewModel
class SaveViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository,
  private val resourceProvider: ResourceProvider
) : ViewModel() {
  val state = MutableLiveData(SaveState.DEFAULT)

  var isLoading by mutableStateOf(false)
    private set

  var message by mutableStateOf<String?>(null)
    private set

  var clientRequestID by mutableStateOf<String?>(null)
    private set

  private fun getAuthToken(): String? = runBlocking {
    datastoreRepo.getString(omnivoreAuthToken)
  }

  /**
   * Checks whether or not the provided URL is valid.
   * @param url The potential URL to validate.
   * @return true if valid, false otherwise.
   */
  fun validateUrl(url: String): Boolean {
    return Patterns.WEB_URL.matcher(url).matches()
  }

  private fun cleanUrl(text: String): String? {
    val pattern = Pattern.compile("\\b(?:https?|ftp)://\\S+")
    val matcher = pattern.matcher(text)

    if (matcher.find()) {
      return matcher.group()
    }
    return null
  }

  fun baseUrl() = runBlocking {
        datastoreRepo.getString(omnivoreSelfHostedApiServer) ?: Constants.apiURL
  }

  private fun serverUrl() = "${baseUrl()}/api/graphql"

  fun saveURL(url: String) {
    viewModelScope.launch {
      isLoading = true
      message = resourceProvider.getString(R.string.save_view_model_msg)
      state.postValue(SaveState.SAVING)

      val authToken = getAuthToken()

      if (authToken == null) {
        message = resourceProvider.getString(R.string.save_view_model_error_not_logged_in)
        isLoading = false
        return@launch
      }

      val apolloClient = ApolloClient.Builder()
        .serverUrl(serverUrl())
        .addHttpHeader("Authorization", value = authToken)
        .build()

      // Attempt to parse the URL out of the text, if that fails send the text
      val cleanedUrl = cleanUrl(url) ?: url

      try {
        clientRequestID = UUID.randomUUID().toString()
        // get locale and timezone from device
        val timezone = TimeZone.getDefault().id
        val locale = Locale.current.toLanguageTag()

        val response = apolloClient.mutation(
          SaveUrlMutation(
            SaveUrlInput(
              clientRequestId = clientRequestID!!,
              source = "android",
              url = cleanedUrl,
              timezone = Optional.present(timezone),
              locale = Optional.present(locale)
            )
          )
        ).execute()

        isLoading = false

        val success = (response.data?.saveUrl?.onSaveSuccess?.url != null)
        if (success) {
          message = resourceProvider.getString(R.string.save_view_model_page_saved_success)
          state.postValue(SaveState.SAVED)
        } else {
          message = resourceProvider.getString(R.string.save_view_model_page_saved_error)
          state.postValue(SaveState.ERROR)
        }
      } catch (e: java.lang.Exception) {
        message = resourceProvider.getString(R.string.save_view_model_page_saved_error)
        state.postValue(SaveState.ERROR)
        isLoading = false
      }
    }
  }

  fun resetState() {
    state.postValue(SaveState.DEFAULT)
  }
}
