package app.omnivore.omnivore.core.database.entities

import android.util.Log
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.database.dao.HighlightChangesDao
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

@Entity
@TypeConverters(StringListTypeConverter::class)
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
    val html: String?,
    var shortId: String,
    val suffix: String?,
    val updatedAt: String?,
    val color: String?,
    val highlightPositionPercent: Double?,
    val highlightPositionAnchorIndex: Int?,
    val overlappingIDs: List<String>?
)

class StringListTypeConverter {
    @TypeConverter
    fun listToString(data: List<String>?): String? {
        data?.let {
            return Gson().toJson(data)
        }
        return null
    }

    @TypeConverter
    fun stringToList(jsonString: String?): List<String>? {
        return if (jsonString.isNullOrEmpty()) {
            null
        } else {
            val itemType = object : TypeToken<List<String>>() {}.type
            return Gson().fromJson<List<String>>(jsonString, itemType)
        }
    }
}


fun saveHighlightChange(
    dao: HighlightChangesDao,
    savedItemId: String,
    highlight: Highlight,
    html: String? = null,
    overlappingIDs: List<String>? = null): HighlightChange {

    Log.d("sync", "saving highlight change: " + highlight.serverSyncStatus + ", " + highlight.type)
    val change = HighlightChange(
        savedItemId = savedItemId,
        highlightId = highlight.highlightId,
        type = highlight.type,
        shortId = highlight.shortId,
        quote = highlight.quote,
        prefix = highlight.prefix,
        suffix = highlight.suffix,
        patch = highlight.patch,
        html = html,
        annotation = highlight.annotation,
        createdAt = highlight.createdAt,
        updatedAt = highlight.updatedAt,
        createdByMe = highlight.createdByMe,
        color =highlight.color,
        highlightPositionPercent = highlight.highlightPositionPercent,
        highlightPositionAnchorIndex = highlight.highlightPositionAnchorIndex,
        serverSyncStatus = highlight.serverSyncStatus,
        overlappingIDs = overlappingIDs
    )
    dao.insertAll(listOf(change))
    return change
}

fun highlightChangeToHighlight(change: HighlightChange): Highlight {
    return Highlight(
        highlightId = change.highlightId,
        type = change.type,
        shortId = change.shortId,
        quote = change.quote,
        prefix = change.prefix,
        suffix = change.suffix,
        patch = change.patch,
        annotation = change.annotation,
        createdAt = change.createdAt,
        updatedAt = change.updatedAt,
        createdByMe = change.createdByMe,
        color = change.color,
        highlightPositionPercent = change.highlightPositionPercent,
        highlightPositionAnchorIndex = change.highlightPositionAnchorIndex,
        serverSyncStatus = change.serverSyncStatus
    )
}
