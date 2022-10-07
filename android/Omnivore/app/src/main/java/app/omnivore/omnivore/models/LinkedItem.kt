package app.omnivore.omnivore.models

import androidx.core.net.toUri

data class LinkedItem(
  val id: String,
  val title: String,
  val createdAt: Any,
  val savedAt: Any,
  val readAt: Any?,
  val updatedAt: Any?,
  val readingProgress: Double,
  val readingProgressAnchor: Int,
  val imageURLString: String?,
  val pageURLString: String,
  val descriptionText: String?,
  val publisherURLString: String?,
  val siteName: String?,
  val author: String?,
  val publishDate: Any?,
  val slug: String,
  val isArchived: Boolean,
  val contentReader: String?,
  val content: String?
) {
  fun publisherDisplayName(): String? {
    return publisherURLString?.toUri()?.host
  }

  fun isPDF(): Boolean {
    val hasPDFSuffix = pageURLString.endsWith("pdf")
    return contentReader == "PDF" || hasPDFSuffix
  }
}
