package app.omnivore.omnivore.persistence.entities

data class LinkedItemLabel(
  val id: String,
  val name: String,
  val color: String,
  val createdAt: Any?,
  val labelDescription: String?,
)
