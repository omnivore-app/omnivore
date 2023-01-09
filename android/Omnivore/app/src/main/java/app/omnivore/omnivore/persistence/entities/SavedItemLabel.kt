package app.omnivore.omnivore.persistence.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import app.omnivore.omnivore.models.ServerSyncStatus

@Entity
data class SavedItemLabel(
  @PrimaryKey val id: String,
  val name: String,
  val color: String,
  val createdAt: String?,
  val labelDescription: String?,
  val serverSyncStatus: Int = 0
)

// has many highlights
// has many savedItems
