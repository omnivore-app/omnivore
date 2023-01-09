package app.omnivore.omnivore

import android.content.Context
import androidx.room.Room
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.persistence.AppDatabase
import javax.inject.Inject

class DataService @Inject constructor(
  context: Context,
  private val networker: Networker
) {
  val db = Room.databaseBuilder(
    context,
    AppDatabase::class.java, "omnivore-database"
  ).build()
}

//suspend fun DataService.sync(): Boolean {
//
//}
