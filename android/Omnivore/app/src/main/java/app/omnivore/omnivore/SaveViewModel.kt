package app.omnivore.omnivore

import android.content.ContentValues
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
  fun getAuthToken(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthToken)
  }

  fun saveURL(url: String) {
    viewModelScope.launch {
      val apiKey = getAuthToken() ?: ""

      val apolloClient = ApolloClient.Builder()
        .serverUrl("${Constants.demoProdURL}/api/graphql")
        .addHttpHeader("Authorization", value = apiKey)
        .build()

      val response = apolloClient.mutation(
        SaveUrlMutation(
          SaveUrlInput(
            clientRequestId = UUID.randomUUID().toString(),
            source = "android",
            url = url
          )
        )
      ).execute()

      val success = (response.data?.saveUrl?.onSaveSuccess?.url != null)
      Log.d(ContentValues.TAG, "Saved URL?: ${success.toString()}")
    }
  }
}
