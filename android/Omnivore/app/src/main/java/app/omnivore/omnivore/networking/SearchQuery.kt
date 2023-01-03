package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SearchQuery
import app.omnivore.omnivore.graphql.generated.TypeaheadSearchQuery
import app.omnivore.omnivore.persistence.entities.LinkedItem
import com.apollographql.apollo3.api.Optional

data class SearchQueryResponse(
  val cursor: String?,
  val items: List<LinkedItem>
)

suspend fun Networker.typeaheadSearch(
  query: String
): SearchQueryResponse {
  try {
    val result = authenticatedApolloClient().query(
      TypeaheadSearchQuery(query)
    ).execute()

    val itemList = result.data?.typeaheadSearch?.onTypeaheadSearchSuccess?.items ?: listOf()

    val items = itemList.map {
      LinkedItem(
        id = it.id,
        title = it.title,
        createdAt = "",
        savedAt = "",
        readAt = "",
        updatedAt = "",
        readingProgress = 0.0,
        readingProgressAnchor = 0,
        imageURLString = null,
        pageURLString = "",
        descriptionText = "",
        publisherURLString = "",
        siteName = it.siteName,
        author = "",
        publishDate = null,
        slug = it.slug,
        isArchived = false,
        contentReader = null,
        content = null
      )
    }

    return SearchQueryResponse(null, items)
  } catch (e: java.lang.Exception) {
    return SearchQueryResponse(null, listOf())
  }
}

suspend fun Networker.search(
  cursor: String? = null,
  limit: Int = 15,
  query: String
): SearchQueryResponse {
  try {
    val result = authenticatedApolloClient().query(
      SearchQuery(
        after = Optional.presentIfNotNull(cursor),
        first = Optional.presentIfNotNull(limit),
        query = Optional.presentIfNotNull(query)
      )
    ).execute()


    val newCursor = result.data?.search?.onSearchSuccess?.pageInfo?.endCursor
    val itemList = result.data?.search?.onSearchSuccess?.edges ?: listOf()

    val items = itemList.map {
      LinkedItem(
        id = it.node.id,
        title = it.node.title,
        createdAt = it.node.createdAt as String,
        savedAt = it.node.savedAt as String,
        readAt = it.node.readAt as String?,
        updatedAt = it.node.updatedAt as String?,
        readingProgress = it.node.readingProgressPercent,
        readingProgressAnchor = it.node.readingProgressAnchorIndex,
        imageURLString = it.node.image,
        pageURLString = it.node.url,
        descriptionText = it.node.description,
        publisherURLString = it.node.originalArticleUrl,
        siteName = it.node.siteName,
        author = it.node.author,
        publishDate = it.node.publishedAt as String?,
        slug = it.node.slug,
        isArchived = it.node.isArchived,
        contentReader = it.node.contentReader.rawValue,
        content = null
      )
    }

    return SearchQueryResponse(newCursor, items)
  } catch (e: java.lang.Exception) {
    return SearchQueryResponse(null, listOf())
  }
}
