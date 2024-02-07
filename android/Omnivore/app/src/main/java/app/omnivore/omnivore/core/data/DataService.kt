package app.omnivore.omnivore.core.data

import android.content.Context
import androidx.room.Room
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.database.AppDatabase
import app.omnivore.omnivore.core.database.entities.Highlight
import app.omnivore.omnivore.core.database.entities.SavedItem
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import javax.inject.Inject

class DataService @Inject constructor(
  context: Context,
  val networker: Networker
) {
  val savedItemSyncChannel = Channel<SavedItem>(capacity = Channel.UNLIMITED)
  val highlightSyncChannel = Channel<Highlight>(capacity = Channel.UNLIMITED)

  val db = Room.databaseBuilder(
    context,
    AppDatabase::class.java, "omnivore-database"
  )
  .fallbackToDestructiveMigration()
  .build()

  init {
    CoroutineScope(Dispatchers.IO).launch {
      startSyncChannels()
    }
  }

  fun clearDatabase() {
    CoroutineScope(Dispatchers.IO).launch {
      db.clearAllTables()
    }
  }
}
