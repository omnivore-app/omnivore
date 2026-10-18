package app.omnivore.omnivore.core.database.entities

import androidx.core.net.toUri
import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class SavedItem(
    @PrimaryKey val savedItemId: String,
    val title: String,
    val folder: String,
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
    val createdId: String? = null,
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

object SavedItemQueryConstants {
    const val libraryColumns = "SavedItem.savedItemId, " +
            "SavedItem.slug, " +
            "SavedItem.createdAt, " +
            "SavedItem.folder, " +
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
