package app.omnivore.omnivore.networking

import app.omnivore.omnivore.Constants
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import com.apollographql.apollo3.ApolloClient
import javax.inject.Inject

class Networker @Inject constructor(
  private val datastoreRepo: DatastoreRepository
) {
  private val serverUrl = "${Constants.apiURL}/api/graphql"
  private suspend fun authToken() = datastoreRepo.getString(DatastoreKeys.omnivoreAuthToken) ?: ""

  suspend fun publicApolloClient() = ApolloClient.Builder()
    .serverUrl(serverUrl)
    .build()

  suspend fun authenticatedApolloClient() = ApolloClient.Builder()
    .serverUrl(serverUrl)
    .addHttpHeader("Authorization", value = authToken())
    .build()
}
