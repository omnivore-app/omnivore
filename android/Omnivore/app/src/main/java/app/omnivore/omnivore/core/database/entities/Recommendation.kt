package app.omnivore.omnivore.core.database.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class Recommendation(
  @PrimaryKey val groupID: String,
  val name: String?,
  val note: String?,
  val recommendedAt: String?
)

// hasOne SavedItem
// hasOne UserProfile
