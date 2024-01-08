package app.omnivore.omnivore.dataService

import android.util.Log
import app.omnivore.omnivore.graphql.generated.type.HighlightType
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.Highlight
import app.omnivore.omnivore.persistence.entities.SavedItemAndHighlightCrossRef
import app.omnivore.omnivore.persistence.entities.saveHighlightChange
import com.apollographql.apollo3.api.Optional
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.merge
import kotlinx.coroutines.withContext
import java.util.*

suspend fun DataService.createWebHighlight(jsonString: String, colorName: String?) {
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
      createdByMe = false,
      color = colorName ?: createHighlightInput.color.getOrNull(),
      highlightPositionPercent = createHighlightInput.highlightPositionPercent.getOrNull() ?: 0.0,
      highlightPositionAnchorIndex = createHighlightInput.highlightPositionAnchorIndex.getOrNull() ?: 0
    )

    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue

    saveHighlightChange(db.highlightChangesDao(), createHighlightInput.articleId, highlight)

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

suspend fun DataService.createNoteHighlight(savedItemId: String, note: String): String {
  val shortId = NanoId.generate(size=14)
  val createHighlightId = UUID.randomUUID().toString()

  withContext(Dispatchers.IO) {
    val highlight = Highlight(
      type = "NOTE",
      highlightId = createHighlightId,
      shortId = shortId,
      quote = null,
      prefix = null,
      suffix = null,
      patch =null,
      annotation = note,
      createdAt = null,
      updatedAt = null,
      createdByMe = true,
      color = null,
      highlightPositionAnchorIndex = 0,
      highlightPositionPercent = 0.0
    )

    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue

    saveHighlightChange(db.highlightChangesDao(), savedItemId, highlight)

    val crossRef = SavedItemAndHighlightCrossRef(
      highlightId = createHighlightId,
      savedItemId = savedItemId
    )

    db.highlightDao().insertAll(listOf(highlight))
    db.savedItemAndHighlightCrossRefDao().insertAll(listOf(crossRef))

    val newHighlight = networker.createHighlight(input = CreateHighlightParams(
      type = HighlightType.NOTE,
      articleId = savedItemId,
      id = createHighlightId,
      shortId = shortId,
      quote = null,
      patch = null,
      annotation = note,
      highlightPositionAnchorIndex = 0,
      highlightPositionPercent = 0.0
    ).asCreateHighlightInput())

    newHighlight?.let {
      db.highlightDao().update(it)
    }
  }

  return createHighlightId
}

suspend fun DataService.mergeWebHighlights(jsonString: String) {
  val mergeHighlightInput = Gson().fromJson(jsonString, MergeHighlightsParams::class.java).asMergeHighlightInput()
  Log.d("sync", "mergeHighlightInput: " + mergeHighlightInput.id + ":  " + mergeHighlightInput)

  withContext(Dispatchers.IO) {
    val highlight = Highlight(
      type = "HIGHLIGHT",
      highlightId = mergeHighlightInput.id,
      shortId = mergeHighlightInput.shortId,
      quote = mergeHighlightInput.quote,
      prefix = null,
      suffix = null,
      patch = mergeHighlightInput.patch,
      annotation = mergeHighlightInput.annotation.getOrNull(),
      createdAt = null,
      updatedAt = null,
      createdByMe = false,
      color = mergeHighlightInput.color.getOrNull(),
      highlightPositionPercent = mergeHighlightInput.highlightPositionPercent.getOrNull() ?: 0.0,
      highlightPositionAnchorIndex = mergeHighlightInput.highlightPositionAnchorIndex.getOrNull() ?: 0
    )

    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue

    saveHighlightChange(db.highlightChangesDao(), mergeHighlightInput.articleId, highlight)

    Log.d("sync", "overlapHighlightIdList: " + mergeHighlightInput.overlapHighlightIdList)
    for (highlightID in mergeHighlightInput.overlapHighlightIdList) {
      deleteHighlight(mergeHighlightInput.articleId, highlightID)
    }

    val crossRef = SavedItemAndHighlightCrossRef(
      highlightId = mergeHighlightInput.id,
      savedItemId = mergeHighlightInput.articleId
    )

    db.highlightDao().insertAll(listOf(highlight))
    db.savedItemAndHighlightCrossRefDao().insertAll(listOf(crossRef))

    val isUpdatedOnServer = networker.mergeHighlights(mergeHighlightInput)
    if (isUpdatedOnServer) {
      highlight.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
      db.highlightDao().update(highlight)
    }
  }
}

suspend fun DataService.updateWebHighlight(jsonString: String) {
  val updateHighlightParams = Gson().fromJson(jsonString, UpdateHighlightParams::class.java)

  if (updateHighlightParams.highlightId == null || updateHighlightParams.libraryItemId == null) {
    Log.d("error","ERROR INVALID HIGHLIGHT DATA")
  }

  withContext(Dispatchers.IO) {
    val highlight = db.highlightDao().findById(highlightId = updateHighlightParams.highlightId ?: "") ?: return@withContext

    highlight.annotation = updateHighlightParams.annotation
    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
    db.highlightDao().update(highlight)

    saveHighlightChange(db.highlightChangesDao(), updateHighlightParams.libraryItemId ?: "", highlight)

    val isUpdatedOnServer = networker.updateHighlight(updateHighlightParams.asUpdateHighlightInput())

    if (isUpdatedOnServer) {
      highlight.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
      db.highlightDao().update(highlight)
    }
  }
}

suspend fun DataService.deleteHighlightFromJSON(jsonString: String) {
  Log.d("sync", "DELETION STRING: " + jsonString)
  val deleteHighlightParams = Gson().fromJson(jsonString, DeleteHighlightParams::class.java)
  deleteHighlight(deleteHighlightParams.libraryItemId, deleteHighlightParams.highlightId)
}

private suspend fun DataService.deleteHighlight(savedItemId: String, highlightID: String) {
  withContext(Dispatchers.IO) {
    val highlight = db.highlightDao().findById(highlightId = highlightID)

    highlight?.let {
      highlight.serverSyncStatus = ServerSyncStatus.NEEDS_DELETION.rawValue
      db.highlightDao().update(highlight)

      saveHighlightChange(db.highlightChangesDao(), savedItemId, highlight)

      val isUpdatedOnServer = networker.deleteHighlights(listOf(highlightID))
      Log.d("sync","DELETING HIGHLIGHT" +  highlightID)

      if (isUpdatedOnServer) {
        Log.d("sync","DELETED HIGHLIGHT" + highlightID)
        db.highlightDao().deleteById(highlightId = highlightID)
      }
    } ?: run {
      Log.d("sync","Could not find highlight for deletion" + savedItemId + "," + highlightID)
    }
  }
}
