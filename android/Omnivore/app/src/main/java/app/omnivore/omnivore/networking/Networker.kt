package app.omnivore.omnivore.networking

import app.omnivore.omnivore.Constants
import com.apollographql.apollo3.ApolloClient

object Networker {
  fun apolloClient(authToken: String) = ApolloClient.Builder()
    .serverUrl("${Constants.apiURL}/api/graphql")
    .addHttpHeader("Authorization", value = authToken)
    .build()
}
