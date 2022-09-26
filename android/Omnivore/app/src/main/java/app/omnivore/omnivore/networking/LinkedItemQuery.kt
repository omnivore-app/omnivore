package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.GetArticleQuery
import app.omnivore.omnivore.models.Highlight
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.models.LinkedItemLabel

data class LinkedItemQueryResponse(
  val item: LinkedItem?,
  val highlights: List<Highlight>,
  val labels: List<LinkedItemLabel>
) {
  companion object {
    fun emptyResponse(): LinkedItemQueryResponse {
      return LinkedItemQueryResponse(null, listOf(), listOf())
    }
  }
}

suspend fun Networker.linkedItem(slug: String): LinkedItemQueryResponse {
  val result = authenticatedApolloClient().query(
    GetArticleQuery(slug = slug)
  ).execute()

  val article = result.data?.article?.onArticleSuccess?.article
    ?: return LinkedItemQueryResponse.emptyResponse()

  val labels = article.labels ?: listOf()

  val linkedItemLabels = labels.map {
    LinkedItemLabel(
      id = it.labelFields.id,
      name = it.labelFields.name,
      color = it.labelFields.color,
      createdAt = it.labelFields.createdAt,
      labelDescription = it.labelFields.description
    )
  }

  val highlights = article.highlights.map {
    Highlight(
      id = it.highlightFields.id,
      shortId = it.highlightFields.shortId,
      quote = it.highlightFields.quote,
      prefix = it.highlightFields.prefix,
      suffix = it.highlightFields.suffix,
      patch = it.highlightFields.patch,
      annotation = it.highlightFields.annotation,
      createdAt = null, // TODO: update gql query to get this
      updatedAt = it.highlightFields.updatedAt,
      createdByMe = it.highlightFields.createdByMe,
    )
  }

  // TODO: handle errors

  val linkedItem = LinkedItem(
    id = article.articleFields.id,
    title = article.articleFields.title,
    createdAt = article.articleFields.createdAt,
    savedAt = article.articleFields.savedAt,
    readAt = article.articleFields.readAt,
    updatedAt = article.articleFields.updatedAt,
    readingProgress = article.articleFields.readingProgressPercent,
    readingProgressAnchor = article.articleFields.readingProgressAnchorIndex,
    imageURLString = article.articleFields.image,
    pageURLString = article.articleFields.url,
    descriptionText = article.articleFields.description,
    publisherURLString = article.articleFields.originalArticleUrl,
    siteName = article.articleFields.siteName,
    author = article.articleFields.author,
    publishDate = article.articleFields.publishedAt,
    slug = article.articleFields.slug,
    isArchived = article.articleFields.isArchived,
    contentReader = article.articleFields.contentReader.rawValue,
    content = article.articleFields.content
  )

  return LinkedItemQueryResponse(item = linkedItem, highlights, labels = linkedItemLabels)
}
