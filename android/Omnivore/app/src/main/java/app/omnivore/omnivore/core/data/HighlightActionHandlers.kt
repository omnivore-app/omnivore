package app.omnivore.omnivore.core.data

import android.util.Log
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.database.entities.Highlight
import app.omnivore.omnivore.core.database.entities.SavedItemAndHighlightCrossRef
import app.omnivore.omnivore.core.database.entities.saveHighlightChange
import app.omnivore.omnivore.core.network.CreateHighlightParams
import app.omnivore.omnivore.core.network.DeleteHighlightParams
import app.omnivore.omnivore.core.network.MergeHighlightsParams
import app.omnivore.omnivore.core.network.UpdateHighlightParams
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

suspend fun DataService.createWebHighlight(jsonString: String, colorName: String?) {
    val createHighlightInput =
        Gson().fromJson(jsonString, CreateHighlightParams::class.java).asCreateHighlightInput()

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
            highlightPositionPercent = createHighlightInput.highlightPositionPercent.getOrNull()
                ?: 0.0,
            highlightPositionAnchorIndex = createHighlightInput.highlightPositionAnchorIndex.getOrNull()
                ?: 0
        )

        highlight.serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue

        val highlightChange =
            saveHighlightChange(db.highlightChangesDao(), createHighlightInput.articleId, highlight)

        val crossRef = SavedItemAndHighlightCrossRef(
            highlightId = createHighlightInput.id, savedItemId = createHighlightInput.articleId
        )

        db.highlightDao().insertAll(listOf(highlight))
        db.savedItemAndHighlightCrossRefDao().insertAll(listOf(crossRef))

        performHighlightChange(highlightChange)
    }
}

suspend fun DataService.createNoteHighlight(savedItemId: String, note: String): String {
    val shortId = NanoId.generate(size = 14)
    val createHighlightId = UUID.randomUUID().toString()

    withContext(Dispatchers.IO) {
        val highlight = Highlight(
            type = "NOTE",
            highlightId = createHighlightId,
            shortId = shortId,
            quote = null,
            prefix = null,
            suffix = null,
            patch = null,
            annotation = note,
            createdAt = null,
            updatedAt = null,
            createdByMe = true,
            color = null,
            highlightPositionAnchorIndex = 0,
            highlightPositionPercent = 0.0
        )

        highlight.serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue

        val highlightChange = saveHighlightChange(db.highlightChangesDao(), savedItemId, highlight)

        val crossRef = SavedItemAndHighlightCrossRef(
            highlightId = createHighlightId, savedItemId = savedItemId
        )

        db.highlightDao().insertAll(listOf(highlight))
        db.savedItemAndHighlightCrossRefDao().insertAll(listOf(crossRef))

        performHighlightChange(highlightChange)
    }

    return createHighlightId
}

suspend fun DataService.mergeWebHighlights(jsonString: String) {
    val mergeHighlightInput =
        Gson().fromJson(jsonString, MergeHighlightsParams::class.java).asMergeHighlightInput()
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
            highlightPositionPercent = mergeHighlightInput.highlightPositionPercent.getOrNull()
                ?: 0.0,
            highlightPositionAnchorIndex = mergeHighlightInput.highlightPositionAnchorIndex.getOrNull()
                ?: 0
        )

        highlight.serverSyncStatus = ServerSyncStatus.NEEDS_MERGE.rawValue

        val highlightChange = saveHighlightChange(
            db.highlightChangesDao(),
            mergeHighlightInput.articleId,
            highlight,
            html = mergeHighlightInput.html.getOrNull(),
            overlappingIDs = mergeHighlightInput.overlapHighlightIdList
        )

        val crossRef = SavedItemAndHighlightCrossRef(
            highlightId = mergeHighlightInput.id, savedItemId = mergeHighlightInput.articleId
        )

        db.highlightDao().insertAll(listOf(highlight))
        db.savedItemAndHighlightCrossRefDao().insertAll(listOf(crossRef))

        Log.d("sync", "Setting up highlight merge")
        performHighlightChange(highlightChange)
    }
}

suspend fun DataService.updateWebHighlight(jsonString: String) {
    val updateHighlightParams = Gson().fromJson(jsonString, UpdateHighlightParams::class.java)

    if (updateHighlightParams.highlightId == null || updateHighlightParams.libraryItemId == null) {
        Log.d("error", "ERROR INVALID HIGHLIGHT DATA")
        return
    }

    withContext(Dispatchers.IO) {
        val highlight =
            db.highlightDao().findById(highlightId = updateHighlightParams.highlightId)
                ?: return@withContext

        highlight.annotation = updateHighlightParams.annotation
        highlight.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
        db.highlightDao().update(highlight)

        val highlightChange = saveHighlightChange(
            db.highlightChangesDao(), updateHighlightParams.libraryItemId, highlight
        )
        performHighlightChange(highlightChange)
    }
}

suspend fun DataService.deleteHighlightFromJSON(jsonString: String) {
    val deleteHighlightParams = Gson().fromJson(jsonString, DeleteHighlightParams::class.java)
    deleteHighlight(deleteHighlightParams.libraryItemId, deleteHighlightParams.highlightId)
}

private suspend fun DataService.deleteHighlight(savedItemId: String, highlightID: String) {
    withContext(Dispatchers.IO) {
        val highlight = db.highlightDao().findById(highlightId = highlightID)

        highlight?.let {
            highlight.serverSyncStatus = ServerSyncStatus.NEEDS_DELETION.rawValue
            db.highlightDao().update(highlight)

            val highlightChange =
                saveHighlightChange(db.highlightChangesDao(), savedItemId, highlight)
            performHighlightChange(highlightChange)
        }
    }
}
