package app.omnivore.omnivore.persistence.entities

import androidx.lifecycle.LiveData
import androidx.room.*

@Entity
data class SavedItemLabel(
  @PrimaryKey val savedItemLabelId: String,
  val name: String,
  val color: String,
  val createdAt: String?,
  val labelDescription: String?,
  val serverSyncStatus: Int = 0
)

@Dao
interface SavedItemLabelDao {
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insertAll(items: List<SavedItemLabel>)

  @Transaction
  @Query("SELECT * FROM SavedItemLabel WHERE serverSyncStatus != 2 ORDER BY name ASC")
  fun getSavedItemLabelsLiveData(): LiveData<List<SavedItemLabel>>
}

@Entity(
  primaryKeys = ["savedItemLabelId", "savedItemId"],
  foreignKeys = [
    ForeignKey(
      entity = SavedItem::class,
      parentColumns = arrayOf("savedItemId"),
      childColumns = arrayOf("savedItemId"),
      onDelete = ForeignKey.CASCADE
    ),
    ForeignKey(
      entity = SavedItemLabel::class,
      parentColumns = arrayOf("savedItemLabelId"),
      childColumns = arrayOf("savedItemLabelId")
    )
  ]
)
data class SavedItemAndSavedItemLabelCrossRef(
  val savedItemLabelId: String,
  val savedItemId: String
)


@Dao
interface SavedItemAndSavedItemLabelCrossRefDao {
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insertAll(items: List<SavedItemAndSavedItemLabelCrossRef>)

  @Query("DELETE FROM savedItemAndSavedItemLabelCrossRef WHERE savedItemId = :savedItemId")
  fun deleteRefsBySavedItemId(savedItemId: String)
}

// has many highlights
// has many savedItems
