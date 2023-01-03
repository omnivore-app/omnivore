package app.omnivore.omnivore.persistence.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class Viewer(
  @PrimaryKey val userID: String,
  val name: String,
  val username: String,
  val profileImageURL: String?,
)

