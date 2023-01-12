package app.omnivore.omnivore.persistence

import androidx.room.Database
import androidx.room.RoomDatabase
import app.omnivore.omnivore.persistence.entities.*

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
  abstract fun savedItemLabelDao(): SavedItemLabelDao
  abstract fun savedItemAndSavedItemLabelCrossRefDao(): SavedItemAndSavedItemLabelCrossRefDao
}
