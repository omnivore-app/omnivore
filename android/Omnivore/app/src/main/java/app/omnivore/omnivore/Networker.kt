package app.omnivore.omnivore

import app.omnivore.omnivore.graphql.generated.SearchQuery
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.ApolloResponse
import com.apollographql.apollo3.api.Optional

object Networker {
  private fun apolloClient(authToken: String) = ApolloClient.Builder()
    .serverUrl("${Constants.apiURL}/api/graphql")
    .addHttpHeader("Authorization", value = authToken)
    .build()

  suspend fun search(
    cursor: String? = null,
    limit: Int = 15,
    query: String,
    authToken: String?
  ): ApolloResponse<SearchQuery.Data> {
    return apolloClient(authToken ?: "").query(
      SearchQuery(
        after = Optional.presentIfNotNull(cursor),
        first = Optional.presentIfNotNull(limit),
        query = Optional.presentIfNotNull(query)
      )
    ).execute()
  }
}
