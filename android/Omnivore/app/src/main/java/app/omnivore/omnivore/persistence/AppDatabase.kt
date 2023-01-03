package app.omnivore.omnivore.persistence

import androidx.room.Database
import androidx.room.RoomDatabase
import app.omnivore.omnivore.persistence.entities.Viewer
import app.omnivore.omnivore.persistence.entities.ViewerDao

@Database(
  entities = [
    Viewer::class
  ],
  version = 1
)
abstract class AppDatabase : RoomDatabase() {
  abstract fun viewerDao(): ViewerDao
}
