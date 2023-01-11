package app.omnivore.omnivore.persistence

import androidx.room.Database
import androidx.room.RoomDatabase
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.persistence.entities.SavedItemAndSavedItemLabelCrossRef
import app.omnivore.omnivore.persistence.entities.SavedItemDao
import app.omnivore.omnivore.persistence.entities.Viewer
import app.omnivore.omnivore.persistence.entities.ViewerDao

@Database(
  entities = [
    Viewer::class,
    SavedItem::class,
    SavedItemLabel::class,
    SavedItemAndSavedItemLabelCrossRef::class
  ],
  version = 2
)
abstract class AppDatabase : RoomDatabase() {
  abstract fun viewerDao(): ViewerDao
  abstract fun savedItemDao(): SavedItemDao
}
