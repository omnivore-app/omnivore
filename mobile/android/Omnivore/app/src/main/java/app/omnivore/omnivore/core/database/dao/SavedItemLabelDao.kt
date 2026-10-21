package app.omnivore.omnivore.core.database.dao

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedItemLabelDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<SavedItemLabel>)

    @Transaction
    @Query("SELECT * FROM SavedItemLabel WHERE serverSyncStatus != 2 ORDER BY name ASC")
    fun getSavedItemLabels(): Flow<List<SavedItemLabel>>

    @Transaction
    @Query("SELECT * FROM SavedItemLabel WHERE serverSyncStatus != 2 ORDER BY name ASC")
    fun getSavedItemLabelsFlow(): Flow<List<SavedItemLabel>>

    @Transaction
    @Query("UPDATE SavedItemLabel set savedItemLabelId = :permanentId,  serverSyncStatus = :status WHERE savedItemLabelId = :tempId")
    fun updateTempLabel(
        tempId: String, permanentId: String, status: ServerSyncStatus = ServerSyncStatus.IS_SYNCED
    )

    @Transaction
    @Query("SELECT * FROM SavedItemLabel WHERE name in (:names) ORDER BY name ASC")
    suspend fun namedLabels(names: List<String>): List<SavedItemLabel>
}
