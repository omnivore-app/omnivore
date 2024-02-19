package app.omnivore.omnivore.core.database.entities

import androidx.core.net.toUri
import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Transaction

@Entity
data class SavedItem(
    @PrimaryKey val savedItemId: String,
    val title: String,
    val createdAt: String,
    val savedAt: String,
    val readAt: String?,
    val updatedAt: String?,
    var readingProgress: Double,
    var readingProgressAnchor: Int,
    val imageURLString: String?,
    val pageURLString: String,
    val descriptionText: String?,
    val publisherURLString: String?,
    val siteName: String?,
    val author: String?,
    val publishDate: String?,
    val slug: String,
    var isArchived: Boolean,
    val contentReader: String? = null,
    val content: String? = null,
    val createdId: String? = null,
    val htmlContent: String? = null,
    val language: String? = null,
    val listenPositionIndex: Int? = null,
    val listenPositionOffset: Double? = null,
    val listenPositionTime: Double? = null,
    val localPDF: String? = null,
    val onDeviceImageURLString: String? = null,
    val originalHtml: String? = null,
    @ColumnInfo(typeAffinity = ColumnInfo.BLOB) val pdfData: ByteArray? = null,
    var serverSyncStatus: Int = 0,
    val tempPDFURL: String? = null,
    val wordsCount: Int? = null,
    val localPDFPath: String? = null

// hasMany highlights
// hasMany labels
// has Many recommendations (rec has one savedItem)
) {
    fun publisherDisplayName(): String? {
        return publisherURLString?.toUri()?.host
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as SavedItem

      return savedItemId == other.savedItemId
    }

    override fun hashCode(): Int {
        return savedItemId.hashCode()
    }
}

data class TypeaheadCardData(
    val savedItemId: String,
    val slug: String,
    val title: String,
    val isArchived: Boolean,
)

@Dao
abstract class SavedItemWithLabelsAndHighlightsDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertSavedItems(items: List<SavedItem>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertLabelCrossRefs(items: List<SavedItemAndSavedItemLabelCrossRef>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertLabels(items: List<SavedItemLabel>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertHighlights(items: List<Highlight>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract fun insertHighlightCrossRefs(items: List<SavedItemAndHighlightCrossRef>)

    @Transaction
    open fun insertAll(savedItems: List<SavedItemWithLabelsAndHighlights>) {
        insertSavedItems(savedItems.map { it.savedItem })

        val labels: MutableList<SavedItemLabel> = mutableListOf()
        val highlights: MutableList<Highlight> = mutableListOf()

        val labelCrossRefs: MutableList<SavedItemAndSavedItemLabelCrossRef> = mutableListOf()
        val highlightCrossRefs: MutableList<SavedItemAndHighlightCrossRef> = mutableListOf()

        for (searchItem in savedItems) {
            labels.addAll(searchItem.labels)
            highlights.addAll(searchItem.highlights)

            val newLabelCrossRefs = searchItem.labels.map {
                SavedItemAndSavedItemLabelCrossRef(
                    savedItemLabelId = it.savedItemLabelId,
                    savedItemId = searchItem.savedItem.savedItemId
                )
            }

            val newHighlightCrossRefs = searchItem.highlights.map {
                SavedItemAndHighlightCrossRef(
                    highlightId = it.highlightId,
                    savedItemId = searchItem.savedItem.savedItemId
                )
            }

            labelCrossRefs.addAll(newLabelCrossRefs)
            highlightCrossRefs.addAll(newHighlightCrossRefs)
        }

        insertLabels(labels)
        insertLabelCrossRefs(labelCrossRefs)

        insertHighlights(highlights)
        insertHighlightCrossRefs(highlightCrossRefs)
    }
}




object SavedItemQueryConstants {
    const val columns =
        "savedItemId, slug, publisherURLString, title, author, descriptionText, imageURLString, isArchived, pageURLString, contentReader, savedAt, readingProgress, wordsCount"
    const val libraryColumns = "SavedItem.savedItemId, " +
            "SavedItem.slug, " +
            "SavedItem.createdAt, " +

            "SavedItem.publisherURLString, " +
            "SavedItem.title, " +
            "SavedItem.author, " +
            "SavedItem.descriptionText, " +
            "SavedItem.imageURLString, " +
            "SavedItem.isArchived, " +
            "SavedItem.pageURLString, " +
            "SavedItem.contentReader, " +
            "SavedItem.savedAt, " +
            "SavedItem.readingProgress, " +
            "SavedItem.readingProgressAnchor, " +
            "SavedItem.serverSyncStatus, " +

            "SavedItem.wordsCount, " +
            "SavedItemLabel.savedItemLabelId, " +
            "SavedItemLabel.name, " +
            "SavedItemLabel.color, " +
            "Highlight.highlightId, " +
            "Highlight.shortId, " +
            "Highlight.createdByMe "
}
