package app.omnivore.omnivore.core.database.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity
data class SavedItemLabel(
    @PrimaryKey val savedItemLabelId: String,
    val name: String,
    val color: String,
    val createdAt: String?,
    val labelDescription: String?,
    val serverSyncStatus: Int = 0
)

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
