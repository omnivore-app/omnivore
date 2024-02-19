package app.omnivore.omnivore.core.database.entities

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Transaction
import app.omnivore.omnivore.core.data.model.ServerSyncStatus

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

    @Transaction
    @Query("UPDATE SavedItemLabel set savedItemLabelId = :permanentId,  serverSyncStatus = :status WHERE savedItemLabelId = :tempId")
    fun updateTempLabel(
        tempId: String, permanentId: String, status: ServerSyncStatus = ServerSyncStatus.IS_SYNCED
    )

    @Transaction
    @Query("SELECT * FROM SavedItemLabel WHERE name in (:names) ORDER BY name ASC")
    fun namedLabels(names: List<String>): List<SavedItemLabel>
}

@Entity(
    primaryKeys = ["savedItemLabelId", "savedItemId"], foreignKeys = [ForeignKey(
        entity = SavedItem::class,
        parentColumns = arrayOf("savedItemId"),
        childColumns = arrayOf("savedItemId"),
        onDelete = ForeignKey.CASCADE
    ), ForeignKey(
        entity = SavedItemLabel::class,
        parentColumns = arrayOf("savedItemLabelId"),
        childColumns = arrayOf("savedItemLabelId")
    )]
)
data class SavedItemAndSavedItemLabelCrossRef(
    val savedItemLabelId: String, val savedItemId: String
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
