package app.omnivore.omnivore.core.network

import app.omnivore.omnivore.core.database.entities.Highlight
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.graphql.generated.SearchQuery
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import com.apollographql.apollo3.api.Optional

data class LibrarySearchQueryResponse(
  val cursor: String?,
  val items: List<LibrarySearchItem>
)

data class LibrarySearchItem(
  val item: SavedItem,
  val labels: List<SavedItemLabel>,
  val highlights: List<Highlight>
)

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
            createdAt = label.labelFields.createdAt as String?,
            labelDescription = null
          )
        },
        highlights = (it.node.highlights ?: listOf()).map { highlight ->
          Highlight(
            highlightId = highlight.highlightFields.id,
            type = highlight.highlightFields.type.toString(),
            annotation = highlight.highlightFields.annotation,
            createdByMe = highlight.highlightFields.createdByMe,
            patch = highlight.highlightFields.patch,
            prefix = highlight.highlightFields.prefix,
            quote = highlight.highlightFields.quote,
            serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue,
            shortId = highlight.highlightFields.shortId,
            suffix  = highlight.highlightFields.suffix,
            updatedAt = highlight.highlightFields.updatedAt as String?,
            createdAt = highlight.highlightFields.createdAt as String?,
            color = highlight.highlightFields.color,
            highlightPositionPercent = highlight.highlightFields.highlightPositionPercent,
            highlightPositionAnchorIndex = highlight.highlightFields.highlightPositionAnchorIndex
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
