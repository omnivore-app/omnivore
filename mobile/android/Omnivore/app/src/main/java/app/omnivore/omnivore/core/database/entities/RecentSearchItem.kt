package app.omnivore.omnivore.core.database.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class RecentSearchItem(
  @PrimaryKey val recentSearchItemId: String,
  val savedAt: String?,
  val term: String?
)
