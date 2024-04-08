package app.omnivore.omnivore.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import app.omnivore.omnivore.core.database.entities.HighlightChange

@Dao
interface HighlightChangesDao {
    @Query("SELECT * FROM highlightChange WHERE serverSyncStatus != 0 ORDER BY updatedAt ASC")
    fun getUnSynced(): List<HighlightChange>

    @Query("DELETE FROM highlightChange WHERE highlightId = :highlightId")
    fun deleteById(highlightId: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertAll(items: List<HighlightChange>)
}
