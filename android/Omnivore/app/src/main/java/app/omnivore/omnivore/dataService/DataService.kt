package app.omnivore.omnivore.dataService

import android.content.Context
import androidx.room.Room
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.AppDatabase
import app.omnivore.omnivore.persistence.entities.Highlight
import app.omnivore.omnivore.persistence.entities.SavedItem
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
