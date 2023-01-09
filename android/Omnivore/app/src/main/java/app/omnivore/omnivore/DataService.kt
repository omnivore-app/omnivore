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

suspend fun DataService.sync(since: String, cursor: String?, limit: Int = 15): Boolean {
  val syncResult = networker.savedItemUpdates(cursor = cursor, limit = limit, since = since) ?: return false

  Log.d("sync", "count: ${syncResult.totalCount}; sync result: $syncResult")
  // TODO: Store items in Room DB

  return true
}

suspend fun DataService.syncOfflineItemsWithServerIfNeeded() {
  // TODO: implement this
}
