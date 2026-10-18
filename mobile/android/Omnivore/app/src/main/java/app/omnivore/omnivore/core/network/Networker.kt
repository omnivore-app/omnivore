package app.omnivore.omnivore.core.network

import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.omnivoreAuthToken
import app.omnivore.omnivore.core.datastore.omnivoreSelfHostedApiServer
import app.omnivore.omnivore.utils.Constants
import com.apollographql.apollo3.ApolloClient
import javax.inject.Inject

class Networker @Inject constructor(
    private val datastoreRepo: DatastoreRepository
) {
    suspend fun baseUrl() =
        datastoreRepo.getString(omnivoreSelfHostedApiServer) ?: Constants.apiURL

    private suspend fun serverUrl() = "${baseUrl()}/api/graphql"
    private suspend fun authToken() = datastoreRepo.getString(omnivoreAuthToken) ?: ""

    suspend fun authenticatedApolloClient() = ApolloClient.Builder().serverUrl(serverUrl())
        .addHttpHeader("Authorization", value = authToken())
        .addHttpHeader("X-OmnivoreClient", value = "android")
        .build()
}
