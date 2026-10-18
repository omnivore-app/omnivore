package app.omnivore.omnivore.core.database.entities

import androidx.room.Dao
import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Insert
import androidx.room.Junction
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Relation
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
