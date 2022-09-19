package app.omnivore.omnivore.models

import androidx.core.net.toUri

public data class LinkedItem(
  public val id: String,
  public val title: String,
  public val createdAt: Any,
//  public val savedAt: Any,
  public val readAt: Any?,
//  public val updatedAt: Any,
  public val readingProgress: Double,
  public val readingProgressAnchor: Int,
  public val imageURLString: String?,
//  public val onDeviceImageURLString: String?,
//  public val documentDirectoryPath: String?,
  public val pageURLString: String,
  public val descriptionText: String?,
  public val publisherURLString: String?,
//  public val siteName: String?,
  public val author: String?,
  public val publishDate: Any?,
  public val slug: String,
//  public val isArchived: Boolean,
//  public val contentReader: String?,
//  public val originalHtml: String?,
) {
  fun publisherDisplayName(): String? {
    return publisherURLString?.toUri()?.host
  }

  fun labelsJSONString(): String {
    return ""
  }
}
