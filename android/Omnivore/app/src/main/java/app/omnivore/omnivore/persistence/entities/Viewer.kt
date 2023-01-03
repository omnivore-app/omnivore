package app.omnivore.omnivore.persistence.entities

data class Viewer(
  val id: String,
  val name: String,
  val username: String,
  val pictureUrl: String?,
)

