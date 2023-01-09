package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.SearchQuery
import app.omnivore.omnivore.graphql.generated.TypeaheadSearchQuery
import app.omnivore.omnivore.graphql.generated.UpdatesSinceQuery
import app.omnivore.omnivore.graphql.generated.type.UpdateReason
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import com.apollographql.apollo3.api.Optional

data class SearchQueryResponse(
  val cursor: String?,
  val cardsData: List<SavedItemCardData>
)

data class SavedItemUpdatesQueryResponse(
  val cursor: String?,
  val hasMoreItems: Boolean,
  val totalCount: Int,
  val deletedItemIDs: List<String>,
  val items: List<SavedItem>
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

suspend fun Networker.savedItemUpdates(
  cursor: String? = null,
  limit: Int = 15,
  since: String
): SavedItemUpdatesQueryResponse? {
  try {
    val result = authenticatedApolloClient().query(
      UpdatesSinceQuery(
        after = Optional.presentIfNotNull(cursor),
        first = Optional.presentIfNotNull(limit),
        since = since
      )
    ).execute()

    val payload = result.data?.updatesSince?.onUpdatesSinceSuccess ?: return null
    val itemNodes: MutableList<UpdatesSinceQuery.Node> = mutableListOf()
    val deletedItemIDs: MutableList<String> = mutableListOf()

    for (edge in payload.edges) {
      if (edge.updateReason == UpdateReason.DELETED) {
        deletedItemIDs.add(edge.itemID)
      } else if (edge.node != null) {
        itemNodes.add(edge.node)
      }
    }

    val savedItems = itemNodes.map {
      SavedItem(
        id = it.id,
        title = it.title,
        createdAt = it.createdAt as String,
        savedAt = it.savedAt as String,
        readAt = it.readAt as String?,
        updatedAt = it.updatedAt as String?,
        readingProgress = it.readingProgressPercent,
        readingProgressAnchor = it.readingProgressAnchorIndex,
        imageURLString = it.image,
        pageURLString = it.url,
        descriptionText = it.description,
        publisherURLString = it.originalArticleUrl,
        siteName = it.siteName,
        author = it.author,
        publishDate = it.publishedAt as String?,
        slug = it.slug,
        isArchived = it.isArchived,
        contentReader = it.contentReader.rawValue,
        content = null
      )
    }

    return SavedItemUpdatesQueryResponse(
      cursor = payload.pageInfo.endCursor,
      hasMoreItems = payload.pageInfo.hasNextPage,
      totalCount = savedItems.size,
      deletedItemIDs = deletedItemIDs,
      items = savedItems
    )
  } catch (e: java.lang.Exception) {
    return null
  }
}
