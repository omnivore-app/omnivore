package app.omnivore.omnivore.core.database.entities

import androidx.room.*
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import com.google.gson.annotations.SerializedName


@Entity
data class Highlight(
  @SerializedName("id")
  @PrimaryKey val highlightId: String,
  val type: String,
  var annotation: String?,
  val createdAt: String?,
  val createdByMe: Boolean = true,
  val markedForDeletion: Boolean = false,
  var patch: String?,
  var prefix: String?,
  var quote: String?,
  var serverSyncStatus: Int = ServerSyncStatus.IS_SYNCED.rawValue,
  var shortId: String,
  val suffix: String?,
  val updatedAt: String?,
  val color: String?,
  val highlightPositionPercent: Double?,
  val highlightPositionAnchorIndex: Int?
)

@Entity(
  primaryKeys = ["highlightId", "savedItemId"],
  foreignKeys = [
    ForeignKey(
      entity = Highlight::class,
      parentColumns = arrayOf("highlightId"),
      childColumns = arrayOf("highlightId"),
      onDelete = ForeignKey.CASCADE
    ),
    ForeignKey(
      entity = SavedItem::class,
      parentColumns = arrayOf("savedItemId"),
      childColumns = arrayOf("savedItemId"),
      onDelete = ForeignKey.CASCADE
    )
  ]
)
data class SavedItemAndHighlightCrossRef(
  val highlightId: String,
  val savedItemId: String
)

@Dao
interface SavedItemAndHighlightCrossRefDao {
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insertAll(items: List<SavedItemAndHighlightCrossRef>)

  @Query("SELECT savedItemId FROM savedItemAndHighlightCrossRef WHERE highlightId = :highlightId")
  fun associatedSavedItemID(highlightId: String): String?
}

data class SavedItemWithLabelsAndHighlights(
  @Embedded val savedItem: SavedItem,

  @Relation(
    parentColumn = "savedItemId",
    entityColumn = "savedItemLabelId",
    associateBy = Junction(SavedItemAndSavedItemLabelCrossRef::class)
  )
  val labels: List<SavedItemLabel>,

  @Relation(
    parentColumn = "savedItemId",
    entityColumn = "highlightId",
    associateBy = Junction(SavedItemAndHighlightCrossRef::class)
  )
  val highlights: List<Highlight>
) {
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as SavedItemWithLabelsAndHighlights

    return savedItem.savedItemId == other.savedItem.savedItemId
  }

  override fun hashCode(): Int {
    return savedItem.savedItemId.hashCode()
  }
}

@Dao
interface HighlightDao {
  @Query("SELECT * FROM highlight WHERE serverSyncStatus != 0")
  fun getUnSynced(): List<Highlight>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insertAll(items: List<Highlight>)

  @Query("DELETE FROM highlight WHERE highlightId = :highlightId")
  fun deleteById(highlightId: String)

  @Query("SELECT * FROM highlight WHERE highlightId = :highlightId")
  fun findById(highlightId: String): Highlight?

  // Server sync status is passed in here to work around Room compile-time query rules, but should always be NEEDS_UPDATE
  @Query("UPDATE highlight SET annotation = :note, serverSyncStatus = :serverSyncStatus WHERE highlightId = :highlightId")
  fun updateNote(highlightId: String, note: String, serverSyncStatus: Int = ServerSyncStatus.NEEDS_UPDATE.rawValue)

  @Update
  fun update(highlight: Highlight)
}
