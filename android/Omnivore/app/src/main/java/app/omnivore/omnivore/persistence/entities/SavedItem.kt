package app.omnivore.omnivore.persistence.entities

import android.util.Log
import androidx.core.net.toUri
import androidx.lifecycle.LiveData
import androidx.room.*
import app.omnivore.omnivore.models.ServerSyncStatus
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
  val tempPDFURL: String? = null,
  val wordsCount: Int? = null

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
        SavedItemAndSavedItemLabelCrossRef(savedItemLabelId = it.savedItemLabelId, savedItemId = searchItem.savedItem.savedItemId)
      }

      val newHighlightCrossRefs = searchItem.highlights.map {
        SavedItemAndHighlightCrossRef(highlightId = it.highlightId, savedItemId = searchItem.savedItem.savedItemId)
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

  @Query("DELETE FROM savedItem WHERE savedItemId = :itemID")
  fun deleteById(itemID: String)

  @Update
  fun update(savedItem: SavedItem)

  @Transaction
  @Query(
    "SELECT ${SavedItemQueryConstants.libraryColumns} " +
            "FROM SavedItem " +
            "LEFT OUTER JOIN SavedItemAndSavedItemLabelCrossRef on SavedItem.savedItemId = SavedItemAndSavedItemLabelCrossRef.savedItemId " +
            "LEFT OUTER JOIN SavedItemAndHighlightCrossRef on SavedItem.savedItemId = SavedItemAndHighlightCrossRef.savedItemId " +

            "LEFT OUTER JOIN SavedItemLabel on SavedItemLabel.savedItemLabelId = SavedItemAndSavedItemLabelCrossRef.savedItemLabelId " +
            "LEFT OUTER  JOIN Highlight on highlight.highlightId = SavedItemAndHighlightCrossRef.highlightId " +

            "WHERE SavedItem.savedItemId = :savedItemId " +

            "GROUP BY SavedItem.savedItemId "
  )
  fun getLibraryItemById(savedItemId: String): LiveData<SavedItemWithLabelsAndHighlights>

  @Transaction
  @Query(
    "SELECT ${SavedItemQueryConstants.libraryColumns} " +
            "FROM SavedItem " +
            "LEFT OUTER JOIN SavedItemAndSavedItemLabelCrossRef on SavedItem.savedItemId = SavedItemAndSavedItemLabelCrossRef.savedItemId " +
            "LEFT OUTER JOIN SavedItemAndHighlightCrossRef on SavedItem.savedItemId = SavedItemAndHighlightCrossRef.savedItemId " +

            "LEFT OUTER JOIN SavedItemLabel on SavedItemLabel.savedItemLabelId = SavedItemAndSavedItemLabelCrossRef.savedItemLabelId " +
            "LEFT OUTER  JOIN Highlight on highlight.highlightId = SavedItemAndHighlightCrossRef.highlightId " +

            "WHERE SavedItem.serverSyncStatus != 2 " +
            "AND SavedItem.isArchived IN (:allowedArchiveStates) " +
            "AND SavedItem.contentReader IN (:allowedContentReaders) " +
            "AND CASE WHEN :hasRequiredLabels THEN SavedItemLabel.name in (:requiredLabels) ELSE 1 END " +
            "AND CASE WHEN :hasExcludedLabels THEN  SavedItemLabel.name is NULL OR SavedItemLabel.name not in (:excludedLabels)  ELSE 1 END " +

            "GROUP BY SavedItem.savedItemId " +

            "ORDER BY \n" +
            "CASE WHEN :sortKey = 'newest' THEN SavedItem.savedAt END DESC,\n" +
            "CASE WHEN :sortKey = 'oldest' THEN SavedItem.savedAt END ASC,\n" +

            "CASE WHEN :sortKey = 'recentlyRead' THEN SavedItem.readAt END DESC,\n" +
            "CASE WHEN :sortKey = 'recentlyPublished' THEN SavedItem.publishDate END DESC"
  )
  fun _filteredLibraryData(allowedArchiveStates: List<Int>, sortKey: String, hasRequiredLabels: Int, hasExcludedLabels: Int, requiredLabels: List<String>, excludedLabels: List<String>, allowedContentReaders: List<String>): LiveData<List<SavedItemWithLabelsAndHighlights>>

  fun filteredLibraryData(allowedArchiveStates: List<Int>, sortKey: String, requiredLabels: List<String>, excludedLabels: List<String>, allowedContentReaders: List<String>): LiveData<List<SavedItemWithLabelsAndHighlights>> {
    val result = _filteredLibraryData(
      allowedArchiveStates = allowedArchiveStates,
      sortKey = sortKey,
      hasRequiredLabels = requiredLabels.size,
      hasExcludedLabels = excludedLabels.size,
      requiredLabels = requiredLabels,
      excludedLabels = excludedLabels,
      allowedContentReaders = allowedContentReaders
    )
    return result
  }
}




object SavedItemQueryConstants {
  const val columns = "savedItemId, slug, publisherURLString, title, author, imageURLString, isArchived, pageURLString, contentReader, savedAt, readingProgress, wordsCount"
  const val libraryColumns = "SavedItem.savedItemId, " +
          "SavedItem.slug, " +
          "SavedItem.createdAt, " +

          "SavedItem.publisherURLString, " +
          "SavedItem.title, " +
          "SavedItem.author, " +
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
