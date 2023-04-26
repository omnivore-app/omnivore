package app.omnivore.omnivore.dataService

import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.Highlight
import app.omnivore.omnivore.persistence.entities.SavedItemAndHighlightCrossRef
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

suspend fun DataService.createWebHighlight(jsonString: String) {
  val createHighlightInput = Gson().fromJson(jsonString, CreateHighlightParams::class.java).asCreateHighlightInput()

  withContext(Dispatchers.IO) {
    val highlight = Highlight(
      type = "HIGHLIGHT",
      highlightId = createHighlightInput.id,
      shortId = createHighlightInput.shortId,
      quote = createHighlightInput.quote.getOrNull(),
      prefix = null,
      suffix = null,
      patch = createHighlightInput.patch.getOrNull(),
      annotation = createHighlightInput.annotation.getOrNull(),
      createdAt = null,
      updatedAt = null,
      createdByMe = false
    )

    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue

    val crossRef = SavedItemAndHighlightCrossRef(
      highlightId = createHighlightInput.id,
      savedItemId = createHighlightInput.articleId
    )

    db.highlightDao().insertAll(listOf(highlight))
    db.savedItemAndHighlightCrossRefDao().insertAll(listOf(crossRef))

    val newHighlight = networker.createHighlight(createHighlightInput)

    newHighlight?.let {
      db.highlightDao().update(it)
    }
  }
}

suspend fun DataService.mergeWebHighlights(jsonString: String) {
  val mergeHighlightInput = Gson().fromJson(jsonString, MergeHighlightsParams::class.java).asMergeHighlightInput()

  withContext(Dispatchers.IO) {
    val highlight = db.highlightDao().findById(highlightId = mergeHighlightInput.id) ?: return@withContext
    highlight.shortId = mergeHighlightInput.shortId
    highlight.quote = mergeHighlightInput.quote
    highlight.patch = mergeHighlightInput.patch
    highlight.prefix = mergeHighlightInput.prefix.getOrNull()
    highlight.annotation = mergeHighlightInput.annotation.getOrNull()
    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue

    for (highlightID in mergeHighlightInput.overlapHighlightIdList) {
      deleteHighlight(highlightID)
    }

    val crossRef = SavedItemAndHighlightCrossRef(
      highlightId = mergeHighlightInput.id,
      savedItemId = mergeHighlightInput.articleId
    )

    db.savedItemAndHighlightCrossRefDao().insertAll(listOf(crossRef))
    db.highlightDao().update(highlight)

    val isUpdatedOnServer = networker.mergeHighlights(mergeHighlightInput)

    if (isUpdatedOnServer) {
      highlight.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
      db.highlightDao().update(highlight)
    }
  }
}

suspend fun DataService.updateWebHighlight(jsonString: String) {
  val updateHighlightParams = Gson().fromJson(jsonString, UpdateHighlightParams::class.java).asUpdateHighlightInput()

  withContext(Dispatchers.IO) {
    val highlight = db.highlightDao().findById(highlightId = updateHighlightParams.highlightId) ?: return@withContext

    highlight.annotation = updateHighlightParams.annotation.getOrNull()
    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
    db.highlightDao().update(highlight)

    val isUpdatedOnServer = networker.updateHighlight(updateHighlightParams)

    if (isUpdatedOnServer) {
      highlight.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
      db.highlightDao().update(highlight)
    }
  }
}

suspend fun DataService.deleteHighlights(jsonString: String) {
  val highlightIDs = Gson().fromJson(jsonString, DeleteHighlightParams::class.java).asIdList()

  for (highlightID in highlightIDs) {
    deleteHighlight(highlightID)
  }
}

private suspend fun DataService.deleteHighlight(highlightID: String) {
  withContext(Dispatchers.IO) {
    val highlight = db.highlightDao().findById(highlightId = highlightID) ?: return@withContext
    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_DELETION.rawValue
    db.highlightDao().update(highlight)

    val isUpdatedOnServer = networker.deleteHighlights(listOf(highlightID))

    if (isUpdatedOnServer) {
      db.highlightDao().deleteById(highlightId = highlightID)
    }
  }
}
