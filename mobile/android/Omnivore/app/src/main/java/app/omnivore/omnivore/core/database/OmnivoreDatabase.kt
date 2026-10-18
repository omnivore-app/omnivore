package app.omnivore.omnivore.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import app.omnivore.omnivore.core.database.dao.HighlightChangesDao
import app.omnivore.omnivore.core.database.dao.HighlightDao
import app.omnivore.omnivore.core.database.dao.SavedItemAndSavedItemLabelCrossRefDao
import app.omnivore.omnivore.core.database.dao.SavedItemDao
import app.omnivore.omnivore.core.database.dao.SavedItemLabelDao
import app.omnivore.omnivore.core.database.dao.SavedItemWithLabelsAndHighlightsDao
import app.omnivore.omnivore.core.database.entities.Highlight
import app.omnivore.omnivore.core.database.entities.HighlightChange
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemAndHighlightCrossRef
import app.omnivore.omnivore.core.database.entities.SavedItemAndHighlightCrossRefDao
import app.omnivore.omnivore.core.database.entities.SavedItemAndSavedItemLabelCrossRef
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.Viewer
import app.omnivore.omnivore.core.database.entities.ViewerDao

@Database(
    entities = [
        Viewer::class,
        SavedItem::class,
        SavedItemLabel::class,
        Highlight::class,
        HighlightChange::class,
        SavedItemAndSavedItemLabelCrossRef::class,
        SavedItemAndHighlightCrossRef::class],
    version = 28,
    exportSchema = true
)
abstract class OmnivoreDatabase : RoomDatabase() {
    abstract fun viewerDao(): ViewerDao
    abstract fun savedItemDao(): SavedItemDao
    abstract fun highlightDao(): HighlightDao
    abstract fun highlightChangesDao(): HighlightChangesDao
    abstract fun savedItemLabelDao(): SavedItemLabelDao
    abstract fun savedItemWithLabelsAndHighlightsDao(): SavedItemWithLabelsAndHighlightsDao
    abstract fun savedItemAndSavedItemLabelCrossRefDao(): SavedItemAndSavedItemLabelCrossRefDao
    abstract fun savedItemAndHighlightCrossRefDao(): SavedItemAndHighlightCrossRefDao
}
