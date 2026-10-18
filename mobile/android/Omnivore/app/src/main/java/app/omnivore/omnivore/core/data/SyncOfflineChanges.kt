package app.omnivore.omnivore.core.data

import android.util.Log
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.database.entities.HighlightChange
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.highlightChangeToHighlight
import app.omnivore.omnivore.core.network.ReadingProgressParams
import app.omnivore.omnivore.core.network.createHighlight
import app.omnivore.omnivore.core.network.deleteHighlights
import app.omnivore.omnivore.core.network.deleteSavedItem
import app.omnivore.omnivore.core.network.mergeHighlights
import app.omnivore.omnivore.core.network.updateArchiveStatusSavedItem
import app.omnivore.omnivore.core.network.updateHighlight
import app.omnivore.omnivore.core.network.updateReadingProgress
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.graphql.generated.type.HighlightType
import app.omnivore.omnivore.graphql.generated.type.MergeHighlightInput
import app.omnivore.omnivore.graphql.generated.type.UpdateHighlightInput
import com.apollographql.apollo3.api.Optional
import kotlinx.coroutines.delay

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
    suspend fun updateSyncStatus(status: ServerSyncStatus) {
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

            val isArchiveServerSynced = networker.updateArchiveStatusSavedItem(
                itemID = item.savedItemId, setAsArchived = item.isArchived
            )

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
            updateSyncStatus(ServerSyncStatus.IS_SYNCING)

            val isUpdatedOnServer = networker.updateHighlight(
                UpdateHighlightInput(
                    annotation = Optional.presentIfNotNull(highlight.annotation),
                    highlightId = highlight.highlightId,
                    sharedAt = Optional.absent()
                )
            )

            if (isUpdatedOnServer) {
                updateSyncStatus(ServerSyncStatus.IS_SYNCED)
            } else {
                updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
            }
            return isUpdatedOnServer != null
        }

        ServerSyncStatus.NEEDS_CREATION.rawValue -> {
            updateSyncStatus(ServerSyncStatus.IS_SYNCING)

            val input = CreateHighlightInput(
                id = highlight.highlightId,
                shortId = highlight.shortId,
                articleId = highlightChange.savedItemId,
                type = Optional.presentIfNotNull(HighlightType.safeValueOf(highlight.type)),
                annotation = Optional.presentIfNotNull(highlight.annotation),
                patch = Optional.presentIfNotNull(highlight.patch),
                quote = Optional.presentIfNotNull(highlight.quote),
            )
            Log.d("sync", "Creating highlight from input: ${input}")
            val createResult = networker.createHighlight(
                input
            )
            return if (createResult.newHighlight != null || createResult.alreadyExists) {
                updateSyncStatus(ServerSyncStatus.IS_SYNCED)
                true
            } else {
                updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
                false
            }
        }

        ServerSyncStatus.NEEDS_MERGE.rawValue -> {
            Log.d("sync", "NEEDS MERGE: ${highlightChange}")

            val mergeHighlightInput = MergeHighlightInput(
                id = highlight.highlightId,
                shortId = highlight.shortId,
                articleId = highlightChange.savedItemId,
                annotation = Optional.presentIfNotNull(highlight.annotation),
                color = Optional.presentIfNotNull(highlight.color),
                highlightPositionAnchorIndex = Optional.presentIfNotNull(highlight.highlightPositionAnchorIndex),
                highlightPositionPercent = Optional.presentIfNotNull(highlight.highlightPositionPercent),
                html = Optional.presentIfNotNull(highlightChange.html),
                overlapHighlightIdList = highlightChange.overlappingIDs ?: emptyList(),
                patch = highlight.patch ?: "",
                prefix = Optional.presentIfNotNull(highlight.prefix),
                quote = highlight.quote ?: "",
                suffix = Optional.presentIfNotNull(highlight.suffix)
            )

            val isUpdatedOnServer = networker.mergeHighlights(mergeHighlightInput)
            if (!isUpdatedOnServer) {
                Log.d("sync", "FAILED TO MERGE HIGHLIGHT")
                highlight.serverSyncStatus = ServerSyncStatus.NEEDS_MERGE.rawValue
                return false
            }

            for (highlightID in mergeHighlightInput.overlapHighlightIdList) {
                Log.d("sync", "DELETING MERGED HIGHLIGHT: ${highlightID}")
                val deleteChange = HighlightChange(
                    highlightId = highlightID,
                    savedItemId = highlightChange.savedItemId,
                    type = "",
                    shortId = "",
                    annotation = null,
                    createdAt = null,
                    patch = null,
                    prefix = null,
                    quote = null,
                    serverSyncStatus = ServerSyncStatus.NEEDS_DELETION.rawValue,
                    html = null,
                    suffix = null,
                    updatedAt = null,
                    color = null,
                    highlightPositionPercent = null,
                    highlightPositionAnchorIndex = null,
                    overlappingIDs = null
                )
                performHighlightChange(deleteChange)
            }
            return true
        }

        else -> return false
    }
}
