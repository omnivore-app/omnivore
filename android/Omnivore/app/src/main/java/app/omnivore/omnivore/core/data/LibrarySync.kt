package app.omnivore.omnivore.core.data

import android.content.Context
import android.util.Log
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.database.entities.Highlight
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.core.network.loadLibraryItemContent
import app.omnivore.omnivore.core.network.saveLibraryItemContentToFile
import app.omnivore.omnivore.core.network.savedItem
import app.omnivore.omnivore.core.network.savedItemUpdates
import app.omnivore.omnivore.core.network.search

suspend fun DataService.librarySearch(context: Context, cursor: String?, query: String): SearchResult {
    val searchResult = networker.search(context, cursor = cursor, limit = 10, query = query)

    val savedItems = searchResult.items.map {
        SavedItemWithLabelsAndHighlights(
            savedItem = it.item,
            labels = it.labels,
            highlights = it.highlights,
        )
    }

    db.savedItemWithLabelsAndHighlightsDao().insertAll(savedItems)

    Log.d(
        "sync",
        "found ${searchResult.items.size} items with search api. Query: $query cursor: $cursor"
    )

    return SearchResult(
        hasError = false,
        hasMoreItems = false,
        cursor = searchResult.cursor,
        count = searchResult.items.size,
        savedItems = savedItems
    )
}

suspend fun DataService.sync(context: Context, since: String, cursor: String?, limit: Int = 20): SavedItemSyncResult {
    val syncResult = networker.savedItemUpdates(cursor = cursor, limit = limit, since = since)
        ?: return SavedItemSyncResult.errorResult

    if (syncResult.deletedItemIDs.isNotEmpty()) {
        db.savedItemDao().deleteByIds(syncResult.deletedItemIDs)
    }

    val savedItems = syncResult.items.map {
        if (!saveLibraryItemContentToFile(context, it.id, it.contentReader, it.content, it.url)) {
            return SavedItemSyncResult(
                hasError = true,
                errorString = "Error saving page content",
                hasMoreItems = false,
                count = 0,
                cursor = null,
                savedItemSlugs = listOf()
            )
        }
        val savedItem = SavedItem(
            savedItemId = it.id,
            title = it.title,
            folder = it.folder,
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
            wordsCount = it.wordsCount,
        )
        val labels = it.labels?.map { label ->
            SavedItemLabel(
                savedItemLabelId = label.labelFields.id,
                name = label.labelFields.name,
                color = label.labelFields.color,
                createdAt = null,
                labelDescription = null
            )
        } ?: listOf()
        val highlights = it.highlights?.map { highlight ->
            Highlight(
                type = highlight.highlightFields.type.toString(),
                highlightId = highlight.highlightFields.id,
                annotation = highlight.highlightFields.annotation,
                createdByMe = highlight.highlightFields.createdByMe,
                markedForDeletion = false,
                patch = highlight.highlightFields.patch,
                prefix = highlight.highlightFields.prefix,
                quote = highlight.highlightFields.quote,
                serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue,
                shortId = highlight.highlightFields.shortId,
                suffix = highlight.highlightFields.suffix,
                createdAt = null,
                updatedAt = highlight.highlightFields.updatedAt as String?,
                color = highlight.highlightFields.color,
                highlightPositionPercent = highlight.highlightFields.highlightPositionPercent,
                highlightPositionAnchorIndex = highlight.highlightFields.highlightPositionAnchorIndex,
            )
        } ?: listOf()
        SavedItemWithLabelsAndHighlights(
            savedItem = savedItem, labels = labels, highlights = highlights
        )
    }

    db.savedItemWithLabelsAndHighlightsDao().insertAll(savedItems)

    Log.d("sync", "found ${syncResult.items.size} items with sync api. Since: $since")

    return SavedItemSyncResult(
        hasError = false,
        errorString = null,
        hasMoreItems = syncResult.hasMoreItems,
        cursor = syncResult.cursor,
        count = syncResult.items.size,
        savedItemSlugs = syncResult.items.map { it.slug }
    )
}

suspend fun DataService.isSavedItemContentStoredInDB(context: Context, slug: String): Boolean {
    val existingItem = db.savedItemDao().getSavedItemWithLabelsAndHighlights(slug)
    existingItem?.savedItem?.savedItemId?.let { savedItemId ->
        val htmlContent = loadLibraryItemContent(context, savedItemId)
        return (htmlContent ?: "").length > 10
    }
    return false
}

suspend fun DataService.fetchSavedItemContent(context: Context, slug: String) {
    val syncResult = networker.savedItem(context, slug)
    val savedItem = syncResult.item
    savedItem?.let {
        val item = SavedItemWithLabelsAndHighlights(
            savedItem = savedItem, labels = syncResult.labels, highlights = syncResult.highlights
        )
        db.savedItemWithLabelsAndHighlightsDao().insertAll(listOf(item))
    }
}


data class SavedItemSyncResult(
    val hasError: Boolean,
    val errorString: String?,
    val hasMoreItems: Boolean,
    val count: Int,
    val savedItemSlugs: List<String>,
    val cursor: String?
) {
    companion object {
        val errorResult = SavedItemSyncResult(
            hasError = true,
            hasMoreItems = true,
            cursor = null,
            count = 0,
            errorString = null,
            savedItemSlugs = listOf()
        )
    }
}

data class SearchResult(
    val hasError: Boolean,
    val hasMoreItems: Boolean,
    val count: Int,
    val savedItems: List<SavedItemWithLabelsAndHighlights>,
    val cursor: String?
) {
    companion object {
        val errorResult = SearchResult(
            hasError = true, hasMoreItems = true, cursor = null, count = 0, savedItems = listOf()
        )
    }
}
