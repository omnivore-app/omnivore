package app.omnivore.omnivore

import app.omnivore.omnivore.graphql.generated.SearchQuery
import app.omnivore.omnivore.models.LinkedItem
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.api.ApolloResponse
import com.apollographql.apollo3.api.Optional

object Networker {
  fun apolloClient(authToken: String) = ApolloClient.Builder()
    .serverUrl("${Constants.apiURL}/api/graphql")
    .addHttpHeader("Authorization", value = authToken)
    .build()
}

suspend fun Networker.search(
  cursor: String? = null,
  limit: Int = 15,
  query: String,
  authToken: String?
): SearchQueryResponse {
  val result = apolloClient(authToken ?: "").query(
    SearchQuery(
      after = Optional.presentIfNotNull(cursor),
      first = Optional.presentIfNotNull(limit),
      query = Optional.presentIfNotNull(query)
    )
  ).execute()

  val cursor = result.data?.search?.onSearchSuccess?.pageInfo?.endCursor
  val itemList = result.data?.search?.onSearchSuccess?.edges ?: listOf()

  val items = itemList.map {
    LinkedItem(
      id = it.node.id,
      title = it.node.title,
      createdAt = it.node.createdAt,
      savedAt = it.node.savedAt,
      readAt = it.node.readAt,
      updatedAt = it.node.updatedAt,
      readingProgress = it.node.readingProgressPercent,
      readingProgressAnchor = it.node.readingProgressAnchorIndex,
      imageURLString = it.node.image,
      pageURLString = it.node.url,
      descriptionText = it.node.description,
      publisherURLString = it.node.originalArticleUrl,
      siteName = it.node.siteName,
      author = it.node.author,
      publishDate = it.node.publishedAt,
      slug = it.node.slug,
      isArchived = it.node.isArchived,
      contentReader = it.node.contentReader.rawValue,
      content = null
    )
  }

  return SearchQueryResponse(cursor, items)
}

data class SearchQueryResponse(
  val cursor: String?,
  val items: List<LinkedItem>
)
