package app.omnivore.omnivore

import android.content.Context
import android.util.Log
import androidx.room.Room
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.savedItemUpdates
import app.omnivore.omnivore.persistence.AppDatabase
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

suspend fun DataService.sync(since: String, cursor: String?, limit: Int = 15): SavedItemSyncMarker {
  val syncResult = networker.savedItemUpdates(cursor = cursor, limit = limit, since = since) ?: return SavedItemSyncMarker.errorResult

  db.savedItemDao().insertAll(syncResult.items)

  return SavedItemSyncMarker(
    hasError = false,
    hasMoreItems = syncResult.hasMoreItems,
    cursor = syncResult.cursor,
    count = syncResult.items.size
  )
}

suspend fun DataService.syncOfflineItemsWithServerIfNeeded() {
  // TODO: implement this
}

data class SavedItemSyncMarker(
  val hasError: Boolean,
  val hasMoreItems: Boolean,
  val count: Int,
  val cursor: String?
) {
  companion object {
    val errorResult = SavedItemSyncMarker(hasError = true, hasMoreItems = true, cursor = null, count = 0)
  }
}
