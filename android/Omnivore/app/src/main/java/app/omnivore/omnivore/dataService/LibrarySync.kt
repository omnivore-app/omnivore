package app.omnivore.omnivore.dataService

import android.util.Log
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.*

suspend fun DataService.librarySearch(cursor: String?, query: String): SearchResult {
  val searchResult = networker.search(cursor = cursor, limit = 10, query = query)

  val savedItems = searchResult.items.map { it.item }

  db.savedItemDao().insertAll(savedItems)

  val labels: MutableList<SavedItemLabel> = mutableListOf()
  val crossRefs: MutableList<SavedItemAndSavedItemLabelCrossRef> = mutableListOf()

  // save labels
  for (searchItem in searchResult.items) {
    labels.addAll(searchItem.labels)

    val newCrossRefs = searchItem.labels.map {
      SavedItemAndSavedItemLabelCrossRef(savedItemLabelId = it.savedItemLabelId, savedItemId = searchItem.item.savedItemId)
    }

    crossRefs.addAll(newCrossRefs)
  }

  db.savedItemLabelDao().insertAll(labels)
  db.savedItemAndSavedItemLabelCrossRefDao().insertAll(crossRefs)

  Log.d("sync", "found ${searchResult.items.size} items with search api. Query: $query cursor: $cursor")

  return SearchResult(
    hasError = false,
    hasMoreItems = false,
    cursor = searchResult.cursor,
    count = searchResult.items.size,
    savedItems = savedItems
  )
}

suspend fun DataService.sync(since: String, cursor: String?, limit: Int = 20): SavedItemSyncResult {
  val syncResult = networker.savedItemUpdates(cursor = cursor, limit = limit, since = since) ?: return SavedItemSyncResult.errorResult

  val savedItems = syncResult.items.map {
    SavedItem(
      savedItemId = it.id,
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

  db.savedItemDao().insertAll(savedItems)

  val labels: MutableList<SavedItemLabel> = mutableListOf()
  val crossRefs: MutableList<SavedItemAndSavedItemLabelCrossRef> = mutableListOf()

  // save labels
  for (item in syncResult.items) {
    val itemLabels = (item.labels ?: listOf()).map {
      SavedItemLabel(
        savedItemLabelId = it.id,
        name = it.name,
        color = it.color,
        createdAt = null,
        labelDescription = null
      )
    }

    labels.addAll(itemLabels)

    val newCrossRefs = itemLabels.map {
      SavedItemAndSavedItemLabelCrossRef(savedItemLabelId = it.savedItemLabelId, savedItemId = item.id)
    }

    crossRefs.addAll(newCrossRefs)
  }

  db.savedItemLabelDao().insertAll(labels)
  db.savedItemAndSavedItemLabelCrossRefDao().insertAll(crossRefs)

  Log.d("sync", "found ${syncResult.items.size} items with sync api. Since: $since")

  return SavedItemSyncResult(
    hasError = false,
    hasMoreItems = syncResult.hasMoreItems,
    cursor = syncResult.cursor,
    count = syncResult.items.size,
    savedItemSlugs = syncResult.items.map { it.slug }
  )
}

fun DataService.isSavedItemContentStoredInDB(slug: String): Boolean {
  val existingItem = db.savedItemDao().getSavedItemWithLabelsAndHighlights(slug)
  val content = existingItem?.savedItem?.content ?: ""
  return content.length > 10
}

suspend fun DataService.fetchSavedItemContent(slug: String) {
  val syncResult = networker.savedItem(slug)
  val isSuccess = syncResult.item != null

  val savedItem = syncResult.item ?: return
  db.savedItemDao().insert(savedItem)

  // Persist Labels
  db.savedItemLabelDao().insertAll(syncResult.labels)

  val labelCrossRefs = syncResult.labels.map {
    SavedItemAndSavedItemLabelCrossRef(savedItemLabelId = it.savedItemLabelId, savedItemId = savedItem.savedItemId)
  }

  db.savedItemAndSavedItemLabelCrossRefDao().insertAll(labelCrossRefs)

  // Persist Highlights
  db.highlightDao().insertAll(syncResult.highlights)

  val highlightCrossRefs = syncResult.highlights.map {
    SavedItemAndHighlightCrossRef(highlightId = it.highlightId, savedItemId = savedItem.savedItemId)
  }

  db.savedItemAndHighlightCrossRefDao().insertAll(highlightCrossRefs)
}


data class SavedItemSyncResult(
  val hasError: Boolean,
  val hasMoreItems: Boolean,
  val count: Int,
  val savedItemSlugs: List<String>,
  val cursor: String?
) {
  companion object {
    val errorResult = SavedItemSyncResult(hasError = true, hasMoreItems = true, cursor = null, count = 0, savedItemSlugs = listOf())
  }
}

data class SearchResult(
  val hasError: Boolean,
  val hasMoreItems: Boolean,
  val count: Int,
  val savedItems: List<SavedItem>,
  val cursor: String?
) {
  companion object {
    val errorResult = SearchResult(hasError = true, hasMoreItems = true, cursor = null, count = 0, savedItems = listOf())
  }
}
