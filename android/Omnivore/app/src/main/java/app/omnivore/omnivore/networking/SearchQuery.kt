package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SearchQuery
import app.omnivore.omnivore.graphql.generated.TypeaheadSearchQuery
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.persistence.entities.TypeaheadCardData
import com.apollographql.apollo3.api.Optional

data class SearchQueryResponse(
  val cursor: String?,
  val cardsData: List<TypeaheadCardData>
)

data class LibrarySearchQueryResponse(
  val cursor: String?,
  val items: List<LibrarySearchItem>
)

data class LibrarySearchItem(
  val item: SavedItem,
  val labels: List<SavedItemLabel>
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
      TypeaheadCardData(
        savedItemId = it.id,
        slug = it.slug,
        title = it.title,
        isArchived = false,
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
): LibrarySearchQueryResponse {
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

    val searchItems = itemList.map {
      LibrarySearchItem(
        item = SavedItem(
          savedItemId = it.node.id,
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
          content = null,
          wordsCount = it.node.wordsCount,
        ),
        labels = (it.node.labels ?: listOf()).map { label ->
          SavedItemLabel(
            savedItemLabelId = label.labelFields.id,
            name = label.labelFields.name,
            color = label.labelFields.color,
            createdAt = null,
            labelDescription = null
          )
        }
      )
    }

    return LibrarySearchQueryResponse(
      cursor = newCursor,
      items = searchItems
    )
  } catch (e: java.lang.Exception) {
    return LibrarySearchQueryResponse(null, listOf())
  }
}
