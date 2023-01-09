package app.omnivore.omnivore

import android.content.Context
import androidx.room.Room
import app.omnivore.omnivore.persistence.AppDatabase
import javax.inject.Inject

class DataService @Inject constructor(
  context: Context
) {
  val db = Room.databaseBuilder(
    context,
    AppDatabase::class.java, "omnivore-database"
  ).build()
}
