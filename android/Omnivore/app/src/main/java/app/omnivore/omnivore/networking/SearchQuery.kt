package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SearchQuery
import app.omnivore.omnivore.graphql.generated.TypeaheadSearchQuery
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import com.apollographql.apollo3.api.Optional

data class SearchQueryResponse(
  val cursor: String?,
  val cardsData: List<SavedItemCardData>
)

suspend fun Networker.typeaheadSearch(
  query: String
): SearchQueryResponse {
  try {
    val result = authenticatedApolloClient().query(
      TypeaheadSearchQuery(query)
    ).execute()

    val itemList = result.data?.typeaheadSearch?.onTypeaheadSearchSuccess?.items ?: listOf()

    val cardsData = itemList.map {
      SavedItemCardData(
        id = it.id,
        slug = it.slug,
        publisherURLString = "",
        title = it.title,
        author = "",
        imageURLString = null,
        isArchived = false,
        pageURLString = "",
        contentReader = null,
      )
    }

    return SearchQueryResponse(null, cardsData)
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

    val cardsData = itemList.map {
      SavedItemCardData(
        id = it.node.id,
        slug = it.node.slug,
        publisherURLString = it.node.originalArticleUrl,
        title = it.node.title,
        author = it.node.author,
        imageURLString = it.node.image,
        isArchived = it.node.isArchived,
        pageURLString = it.node.url,
        contentReader = it.node.contentReader.rawValue,
      )
    }

    return SearchQueryResponse(newCursor, cardsData)
  } catch (e: java.lang.Exception) {
    return SearchQueryResponse(null, listOf())
  }
}
