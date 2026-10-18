package app.omnivore.omnivore.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.database.entities.Highlight

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
