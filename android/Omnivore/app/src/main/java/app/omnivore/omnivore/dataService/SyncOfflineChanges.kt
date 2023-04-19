package app.omnivore.omnivore.dataService

import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.graphql.generated.type.UpdateHighlightInput
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.Highlight
import app.omnivore.omnivore.persistence.entities.SavedItem
import com.apollographql.apollo3.api.Optional
import com.apollographql.apollo3.api.Optional.Companion.absent
import com.apollographql.apollo3.api.Optional.Companion.presentIfNotNull
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.*

suspend fun DataService.startSyncChannels() {
  for (savedItem in savedItemSyncChannel) {
    syncSavedItem(savedItem)
  }

  for (highlight in highlightSyncChannel) {
    syncHighlight(highlight)
  }
}

suspend fun DataService.syncOfflineItemsWithServerIfNeeded() {
  val unSyncedSavedItems = db.savedItemDao().getUnSynced()
  val unSyncedHighlights = db.highlightDao().getUnSynced()

  for (savedItem in unSyncedSavedItems) {
    delay(250)
    savedItemSyncChannel.send(savedItem)
  }

  for (highlight in unSyncedHighlights) {
    delay(250)
    highlightSyncChannel.send(highlight)
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
          patch = Optional.presentIfNotNull(highlight.patch),
          quote = Optional.presentIfNotNull(highlight.quote),
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
