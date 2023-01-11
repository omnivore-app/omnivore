package app.omnivore.omnivore

import android.content.Context
import androidx.room.Room
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.savedItem
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

suspend fun DataService.sync(since: String, cursor: String?, limit: Int = 15): SavedItemSyncResult {
  val syncResult = networker.savedItemUpdates(cursor = cursor, limit = limit, since = since) ?: return SavedItemSyncResult.errorResult

  db.savedItemDao().insertAll(syncResult.items)

  return SavedItemSyncResult(
    hasError = false,
    hasMoreItems = syncResult.hasMoreItems,
    cursor = syncResult.cursor,
    count = syncResult.items.size,
    savedItemSlugs = syncResult.items.map { it.id }
  )
}

suspend fun DataService.syncSavedItemContent(slug: String) {
  val syncResult = networker.savedItem(slug)

//  syncResult.item
}

suspend fun DataService.syncOfflineItemsWithServerIfNeeded() {
  // TODO: implement this
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
