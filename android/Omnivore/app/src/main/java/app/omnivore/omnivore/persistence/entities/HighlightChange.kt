package app.omnivore.omnivore.persistence.entities

import android.util.Log
import androidx.room.Dao
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import app.omnivore.omnivore.models.ServerSyncStatus
import com.google.gson.annotations.SerializedName

@Entity
data class HighlightChange(
    @PrimaryKey val highlightId: String,
    val savedItemId: String,

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

fun saveHighlightChange(dao: HighlightChangesDao, savedItemId: String, highlight: Highlight): HighlightChange {
    Log.d("sync", "saving highlight change: " + savedItemId + ", " + highlight)
    val change = HighlightChange(
        savedItemId = savedItemId,
        highlightId = highlight.highlightId,
        type = highlight.type,
        shortId = highlight.shortId,
        quote = highlight.quote,
        prefix = highlight.prefix,
        suffix = highlight.suffix,
        patch = highlight.patch,
        annotation = highlight.annotation,
        createdAt = highlight.createdAt,
        updatedAt = highlight.updatedAt,
        createdByMe = highlight.createdByMe,
        color =highlight.color,
        highlightPositionPercent = highlight.highlightPositionPercent,
        highlightPositionAnchorIndex = highlight.highlightPositionAnchorIndex,
        serverSyncStatus = highlight.serverSyncStatus
    )
    dao.insertAll(listOf(change))
    return change
}

@Dao
interface HighlightChangesDao {
    @Query("SELECT * FROM highlightChange WHERE serverSyncStatus != 0 ORDER BY updatedAt ASC")
    fun getUnSynced(): List<HighlightChange>

    @Query("DELETE FROM highlightChange WHERE highlightId = :highlightId")
    fun deleteById(highlightId: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertAll(items: List<HighlightChange>)
}

