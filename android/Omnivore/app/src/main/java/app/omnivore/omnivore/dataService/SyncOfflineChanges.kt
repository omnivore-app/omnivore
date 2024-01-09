package app.omnivore.omnivore.dataService

import android.util.Log
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.graphql.generated.type.UpdateHighlightInput
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.Highlight
import app.omnivore.omnivore.persistence.entities.HighlightChange
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.highlightChangeToHighlight
import com.apollographql.apollo3.api.Optional
import kotlinx.coroutines.delay
import kotlin.math.log

suspend fun DataService.startSyncChannels() {
  Log.d("sync", "Starting sync channels")
  for (savedItem in savedItemSyncChannel) {
    syncSavedItem(savedItem)
  }
}

suspend fun DataService.performHighlightChange(highlightChange: HighlightChange) {
  val highlight = highlightChangeToHighlight(highlightChange)
  if (syncHighlightChange(highlightChange)) {
    db.highlightChangesDao().deleteById(highlight.highlightId)
  }
}


suspend fun DataService.syncOfflineItemsWithServerIfNeeded() {
  val unSyncedSavedItems = db.savedItemDao().getUnSynced()
  val unSyncedHighlights = db.highlightChangesDao().getUnSynced()

  for (savedItem in unSyncedSavedItems) {
    delay(250)
    savedItemSyncChannel.send(savedItem)
  }

  for (change in unSyncedHighlights) {
    performHighlightChange(change)
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
          force = item.contentReader == "PDF",
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

private suspend fun DataService.syncHighlightChange(highlightChange: HighlightChange): Boolean {
  val highlight = highlightChangeToHighlight(highlightChange)

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
      return isDeletedOnServer != null
    }

    ServerSyncStatus.NEEDS_UPDATE.rawValue -> {
      Log.d("sync", "creating highlight update change: ${highlightChange}")

      updateSyncStatus(ServerSyncStatus.IS_SYNCING)

      val isUpdatedOnServer = networker.updateHighlight(
        UpdateHighlightInput(
          annotation = Optional.presentIfNotNull(highlight.annotation),
          highlightId = highlight.highlightId,
          sharedAt = Optional.absent()
        )
      )
      Log.d("sync", "sycn.updateHighlight result: ${isUpdatedOnServer}")

      if (isUpdatedOnServer) {
        updateSyncStatus(ServerSyncStatus.IS_SYNCED)
      } else {
        updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
      }
      return isUpdatedOnServer != null
    }

    ServerSyncStatus.NEEDS_CREATION.rawValue -> {
      Log.d("sync", "creating highlight create change: ${highlightChange}")
      updateSyncStatus(ServerSyncStatus.IS_SYNCING)

      val createResult = networker.createHighlight(
        CreateHighlightInput(
          annotation = Optional.presentIfNotNull(highlight.annotation),
          articleId = highlightChange.savedItemId,
          id = highlight.highlightId,
          patch = Optional.presentIfNotNull(highlight.patch),
          quote = Optional.presentIfNotNull(highlight.quote),
          shortId = highlight.shortId
        )
      )
      Log.d("sync", "sycn.createResult: " + createResult)

      if (createResult.newHighlight != null || createResult.alreadyExists) {
        updateSyncStatus(ServerSyncStatus.IS_SYNCED)
        return true
      } else {
        updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
        return false
      }
    }
    else -> return false
  }
}
