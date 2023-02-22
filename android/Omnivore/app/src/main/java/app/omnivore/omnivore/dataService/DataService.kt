package app.omnivore.omnivore.dataService

import android.content.Context
import androidx.room.Room
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.AppDatabase
import kotlinx.coroutines.*
import javax.inject.Inject

class DataService @Inject constructor(
  context: Context,
  val networker: Networker
) {
  val db = Room.databaseBuilder(
    context,
    AppDatabase::class.java, "omnivore-database"
  ).build()

  fun clearDatabase() {
    CoroutineScope(Dispatchers.IO).launch {
      db.clearAllTables()
    }
  }
}
