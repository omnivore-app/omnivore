package app.omnivore.omnivore

import android.content.Context
import android.util.Log
import androidx.room.Room
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.graphql.generated.type.UpdateHighlightInput
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.AppDatabase
import app.omnivore.omnivore.persistence.entities.*
import com.apollographql.apollo3.api.Optional
import javax.inject.Inject

class DataService @Inject constructor(
  context: Context,
  val networker: Networker
) {
  val db = Room.databaseBuilder(
    context,
    AppDatabase::class.java, "omnivore-database"
  ).build()
}

suspend fun DataService.sync(since: String, cursor: String?, limit: Int = 15): SavedItemSyncResult {
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

  return SavedItemSyncResult(
    hasError = false,
    hasMoreItems = syncResult.hasMoreItems,
    cursor = syncResult.cursor,
    count = syncResult.items.size,
    savedItemSlugs = syncResult.items.map { it.slug }
  )
}

suspend fun DataService.syncSavedItemContent(slug: String) {
  val syncResult = networker.savedItem(slug)

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

  Log.d("sync", "saved content for item with id: ${savedItem.savedItemId}")
}

suspend fun DataService.syncOfflineItemsWithServerIfNeeded() {
  val unSyncedSavedItems = db.savedItemDao().getUnSynced()
  val unSyncedHighlights = db.highlightDao().getUnSynced()

  for (savedItem in unSyncedSavedItems) {
    syncSavedItem(savedItem)
  }

  for (highlight in unSyncedHighlights) {
    syncHighlight(highlight)
  }
}

private suspend fun DataService.syncSavedItem(item: SavedItem) {
  fun updateSyncStatus(status: ServerSyncStatus) {
    item.serverSyncStatus = status.rawValue
    db.savedItemDao().update(item)
  }

  when (item.serverSyncStatus) {
    ServerSyncStatus.NEEDS_DELETION.rawValue -> {
      updateSyncStatus(ServerSyncStatus.IS_SYNCING)

      val isDeletedOnServer = networker.deleteSavedItem(item.savedItemId)

      if (isDeletedOnServer) {
        db.savedItemDao().deleteById(item.savedItemId)
      } else {
        updateSyncStatus(ServerSyncStatus.NEEDS_DELETION)
      }
    }
    ServerSyncStatus.NEEDS_UPDATE.rawValue -> {
      updateSyncStatus(ServerSyncStatus.IS_SYNCING)

      val isArchiveServerSynced = networker.updateArchiveStatusSavedItem(itemID = item.savedItemId, setAsArchived = item.isArchived)

      val isReadingProgressSynced = networker.updateReadingProgress(
        ReadingProgressParams(
          id = item.savedItemId,
          readingProgressPercent = item.readingProgress,
          readingProgressAnchorIndex = item.readingProgressAnchor
        )
      )

      if (isArchiveServerSynced && isReadingProgressSynced) {
        updateSyncStatus(ServerSyncStatus.IS_SYNCED)
      } else {
        updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
      }
    }
    ServerSyncStatus.NEEDS_CREATION.rawValue -> {
      // TODO: implement when we are able to create content on device
      // updateSyncStatus(ServerSyncStatus.IS_SYNCING)
      // send update to server
      // update db
    }
    else -> return
  }
}

private suspend fun DataService.syncHighlight(highlight: Highlight) {
  fun updateSyncStatus(status: ServerSyncStatus) {
    highlight.serverSyncStatus = status.rawValue
    db.highlightDao().update(highlight)
  }

  when (highlight.serverSyncStatus) {
    ServerSyncStatus.NEEDS_DELETION.rawValue -> {
      updateSyncStatus(ServerSyncStatus.IS_SYNCING)

      val isDeletedOnServer = networker.deleteHighlights(listOf(highlight.highlightId))

      if (isDeletedOnServer) {
        db.highlightDao().deleteById(highlight.highlightId)
      } else {
        updateSyncStatus(ServerSyncStatus.NEEDS_DELETION)
      }
    }
    ServerSyncStatus.NEEDS_UPDATE.rawValue -> {
      updateSyncStatus(ServerSyncStatus.IS_SYNCING)

      val isUpdatedOnServer = networker.updateHighlight(
        UpdateHighlightInput(
          annotation = Optional.presentIfNotNull(highlight.annotation),
          highlightId = highlight.highlightId ?: "",
          sharedAt = Optional.absent()
        )
      )

      if (isUpdatedOnServer) {
        updateSyncStatus(ServerSyncStatus.IS_SYNCED)
      } else {
        updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
      }
    }
    ServerSyncStatus.NEEDS_CREATION.rawValue -> {
      updateSyncStatus(ServerSyncStatus.IS_SYNCING)

      val savedItemID = db.savedItemAndHighlightCrossRefDao()
        .associatedSavedItemID(highlightId = highlight.highlightId)

      val isCreatedOnServer = networker.createHighlight(
        CreateHighlightInput(
          annotation = Optional.presentIfNotNull(highlight.annotation),
          articleId = savedItemID ?: "",
          id = highlight.highlightId,
          patch = highlight.patch ?: "",
          quote = highlight.quote ?: "",
          shortId = highlight.shortId ?: ""
        )
      )

      if (isCreatedOnServer != null) {
        updateSyncStatus(ServerSyncStatus.IS_SYNCED)
      } else {
        updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
      }
    }
    else -> return
  }
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
