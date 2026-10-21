package app.omnivore.omnivore.core.data

import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.network.archiveSavedItem
import app.omnivore.omnivore.core.network.deleteSavedItem
import app.omnivore.omnivore.core.network.unarchiveSavedItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

suspend fun DataService.deleteSavedItem(itemID: String) {
    withContext(Dispatchers.IO) {
        val savedItem = db.savedItemDao().findById(itemID = itemID) ?: return@withContext
        savedItem.serverSyncStatus = ServerSyncStatus.NEEDS_DELETION.rawValue
        db.savedItemDao().update(savedItem)

        val isUpdatedOnServer = networker.deleteSavedItem(itemID)

        if (isUpdatedOnServer) {
            db.savedItemDao().deleteById(itemID)
        }
    }
}

suspend fun DataService.archiveSavedItem(itemID: String) {
    withContext(Dispatchers.IO) {
        val savedItem = db.savedItemDao().findById(itemID = itemID) ?: return@withContext

        savedItem.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
        savedItem.isArchived = true
        db.savedItemDao().update(savedItem)

        val isUpdatedOnServer = networker.archiveSavedItem(itemID)

        if (isUpdatedOnServer) {
            savedItem.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            db.savedItemDao().update(savedItem)
        }
    }
}

suspend fun DataService.unarchiveSavedItem(itemID: String) {
    withContext(Dispatchers.IO) {
        val savedItem = db.savedItemDao().findById(itemID = itemID) ?: return@withContext

        savedItem.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
        savedItem.isArchived = false
        db.savedItemDao().update(savedItem)

        val isUpdatedOnServer = networker.unarchiveSavedItem(itemID)

        if (isUpdatedOnServer) {
            savedItem.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            db.savedItemDao().update(savedItem)
        }
    }
}

