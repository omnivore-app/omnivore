package app.omnivore.omnivore.persistence

import androidx.room.Database
import androidx.room.RoomDatabase
import app.omnivore.omnivore.persistence.entities.*

@Database(
  entities = [
    Viewer::class,
    SavedItem::class,
    SavedItemLabel::class,
    Highlight::class,
    SavedItemAndSavedItemLabelCrossRef::class,
    SavedItemAndHighlightCrossRef::class
  ],
  version = 6
)
abstract class AppDatabase : RoomDatabase() {
  abstract fun viewerDao(): ViewerDao
  abstract fun savedItemDao(): SavedItemDao
  abstract fun highlightDao(): HighlightDao
  abstract fun savedItemLabelDao(): SavedItemLabelDao
  abstract fun savedItemWithLabelsAndHighlightsDao(): SavedItemWithLabelsAndHighlightsDao
  abstract fun savedItemAndSavedItemLabelCrossRefDao(): SavedItemAndSavedItemLabelCrossRefDao
  abstract fun savedItemAndHighlightCrossRefDao(): SavedItemAndHighlightCrossRefDao
}
