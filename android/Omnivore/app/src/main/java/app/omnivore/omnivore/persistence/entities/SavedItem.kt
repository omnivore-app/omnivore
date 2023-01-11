package app.omnivore.omnivore.persistence.entities

import androidx.core.net.toUri
import androidx.lifecycle.LiveData
import androidx.room.*
import java.util.*

@Entity
data class SavedItem(
  @PrimaryKey val savedItemId: String,
  val title: String,
  val createdAt: String,
  val savedAt: String,
  val readAt: String?,
  val updatedAt: String?,
  val readingProgress: Double,
  val readingProgressAnchor: Int,
  val imageURLString: String?,
  val pageURLString: String,
  val descriptionText: String?,
  val publisherURLString: String?,
  val siteName: String?,
  val author: String?,
  val publishDate: String?,
  val slug: String,
  val isArchived: Boolean,
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
  val serverSyncStatus: Int = 0,
  val tempPDFURL: String? = null

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

    if (savedItemId != other.savedItemId) return false

    return true
  }

  override fun hashCode(): Int {
    return savedItemId.hashCode()
  }
}

data class SavedItemCardData(
  val savedItemId: String,
  val slug: String,
  val publisherURLString: String?,
  val title: String,
  val author: String?,
  val imageURLString: String?,
  val isArchived: Boolean,
  val pageURLString: String,
  val contentReader: String?
) {
  fun publisherDisplayName(): String? {
    return publisherURLString?.toUri()?.host
  }

  fun isPDF(): Boolean {
    val hasPDFSuffix = pageURLString.endsWith("pdf")
    return contentReader == "PDF" || hasPDFSuffix
  }
}

@Dao
interface SavedItemDao {
  @Query("SELECT savedItemId, slug, publisherURLString, title, author, imageURLString, isArchived, pageURLString, contentReader FROM SavedItem ORDER BY savedAt DESC")
  fun getLibraryLiveData(): LiveData<List<SavedItemCardData>>

  @Query("SELECT * FROM savedItem")
  fun getAll(): List<SavedItem>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insertAll(items: List<SavedItem>)

  @Query("DELETE FROM savedItem WHERE savedItemId = :itemID")
  fun deleteById(itemID: String)
}
