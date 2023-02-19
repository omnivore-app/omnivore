package app.omnivore.omnivore.persistence.entities

import androidx.core.net.toUri
import androidx.lifecycle.LiveData
import androidx.room.*
import app.omnivore.omnivore.BuildConfig
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.ui.library.SavedItemSortFilter
import java.util.*

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
  @Query("SELECT * FROM savedItem")
  fun getAll(): List<SavedItem>

  @Query("SELECT * FROM savedItem WHERE savedItemId = :itemID")
  fun findById(itemID: String): SavedItem?

  @Query("SELECT * FROM savedItem WHERE serverSyncStatus != 0")
  fun getUnSynced(): List<SavedItem>

  @Query("SELECT * FROM savedItem WHERE slug = :slug")
  fun getSavedItemWithLabelsAndHighlights(slug: String): SavedItemWithLabelsAndHighlights?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insertAll(items: List<SavedItem>)

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insert(item: SavedItem)

  @Query("DELETE FROM savedItem WHERE savedItemId = :itemID")
  fun deleteById(itemID: String)

  @Update
  fun update(savedItem: SavedItem)

  @Transaction
  @Query(
    "SELECT ${SavedItemQueryConstants.columns} " +
      "FROM SavedItem " +
      "WHERE serverSyncStatus != 2 AND isArchived != :archiveFilter " +
      "ORDER BY savedAt DESC"
  )
  fun getLibraryLiveData(archiveFilter: Int): LiveData<List<SavedItemCardDataWithLabels>>

  @Transaction
  @Query(
    "SELECT ${SavedItemQueryConstants.columns} " +
      "FROM SavedItem " +
      "WHERE serverSyncStatus != 2 AND isArchived != :archiveFilter " +
      "ORDER BY savedAt ASC"
  )
  fun getLibraryLiveDataSortedByOldest(archiveFilter: Int): LiveData<List<SavedItemCardDataWithLabels>>

  @Transaction
  @Query(
    "SELECT ${SavedItemQueryConstants.columns} " +
      "FROM SavedItem " +
      "WHERE serverSyncStatus != 2 AND isArchived != :archiveFilter " +
      "ORDER BY readAt DESC, savedAt DESC"
  )
  fun getLibraryLiveDataSortedByRecentlyRead(archiveFilter: Int): LiveData<List<SavedItemCardDataWithLabels>>

  @Transaction
  @Query(
    "SELECT ${SavedItemQueryConstants.columns} " +
      "FROM SavedItem " +
      "WHERE serverSyncStatus != 2 AND isArchived != :archiveFilter " +
      "ORDER BY publishDate DESC"
  )
  fun getLibraryLiveDataSortedByRecentlyPublished(archiveFilter: Int): LiveData<List<SavedItemCardDataWithLabels>>
}


object SavedItemQueryConstants {
  const val columns = "savedItemId, slug, publisherURLString, title, author, imageURLString, isArchived, pageURLString, contentReader "
}

// Archive Status:

//INBOX("Inbox", rawValue = "inbox", "in:inbox"),
//READ_LATER("Read Later", "readlater", "in:inbox -label:Newsletter"),
//NEWSLETTERS("Newsletters", "newsletters", "in:inbox label:Newsletter"),
//RECOMMENDED("Recommended", "recommended", "recommendedBy:*"),
//ALL("All", "all", "in:all"),
//ARCHIVED("Archived", "archived", "in:archive"),
//HAS_HIGHLIGHTS("Highlighted", "hasHighlights", "has:highlights"),
//FILES("Files", "files", "type:file"),


//let notInArchivePredicate = NSPredicate(
//format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: false) as NSNumber
//)

//switch self {
//  case .inbox:
//  // non-archived items
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, notInArchivePredicate])

//  case .readlater:
//  // non-archived or deleted items without the Newsletter label
//  let nonNewsletterLabelPredicate = NSPredicate(
//    format: "NOT SUBQUERY(labels, $label, $label.name == \"Newsletter\") .@count > 0"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [
//    undeletedPredicate, notInArchivePredicate, nonNewsletterLabelPredicate
//  ])
//  case .newsletters:
//  // non-archived or deleted items with the Newsletter label
//  let newsletterLabelPredicate = NSPredicate(
//    format: "SUBQUERY(labels, $label, $label.name == \"Newsletter\").@count > 0"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, newsletterLabelPredicate])
//  case .recommended:
//  // non-archived or deleted items with the Newsletter label
//  let recommendedPredicate = NSPredicate(
//    format: "recommendations.@count > 0"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [notInArchivePredicate, recommendedPredicate])
//  case .all:
//  // include everything undeleted
//  return undeletedPredicate
//  case .archived:
//  let inArchivePredicate = NSPredicate(
//    format: "%K == %@", #keyPath(LinkedItem.isArchived), Int(truncating: true) as NSNumber
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, inArchivePredicate])
//  case .files:
//  // include pdf only
//  let isPDFPredicate = NSPredicate(
//    format: "%K == %@", #keyPath(LinkedItem.contentReader), "PDF"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [undeletedPredicate, isPDFPredicate])
//  case .hasHighlights:
//  let hasHighlightsPredicate = NSPredicate(
//    format: "highlights.@count > 0"
//  )
//  return NSCompoundPredicate(andPredicateWithSubpredicates: [
//    hasHighlightsPredicate
//  ])
//}
//}
//}
