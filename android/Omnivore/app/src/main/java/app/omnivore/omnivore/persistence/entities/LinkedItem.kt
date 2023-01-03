package app.omnivore.omnivore.persistence.entities

import androidx.core.net.toUri
import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class LinkedItem(
  @PrimaryKey val id: String,
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
  val serverSyncStatus: Int = 0, // TODO: implement,
  val tempPDFURL: String? = null

// hasMany highlights
// hasMany labels
// has Many recommendations (rec has one linkedItem)
) {
  fun publisherDisplayName(): String? {
    return publisherURLString?.toUri()?.host
  }

  fun isPDF(): Boolean {
    val hasPDFSuffix = pageURLString.endsWith("pdf")
    return contentReader == "PDF" || hasPDFSuffix
  }

  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as LinkedItem

    if (id != other.id) return false

    return true
  }

  override fun hashCode(): Int {
    return id.hashCode()
  }
}
