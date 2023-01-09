package app.omnivore.omnivore.persistence.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class RecentSearchItem(
  @PrimaryKey val id: String,
  val savedAt: String?,
  val term: String?
)
