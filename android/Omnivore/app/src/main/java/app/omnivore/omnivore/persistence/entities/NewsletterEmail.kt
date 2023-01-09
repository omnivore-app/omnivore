package app.omnivore.omnivore.persistence.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class NewsletterEmail(
  @PrimaryKey val userID: String,
  val confirmationCode: String?,
  val email: String?,
  val emailID: String?
)
