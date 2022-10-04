package app.omnivore.omnivore.models

data class Highlight(
  val id: String,
  val shortId: String,
  val quote: String,
  val prefix: String?,
  val suffix: String?,
  val patch: String,
  val annotation: String?,
  val createdAt: Any?,
  val updatedAt: Any?,
  val createdByMe : Boolean,
)

