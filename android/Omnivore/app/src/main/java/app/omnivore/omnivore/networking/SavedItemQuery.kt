package app.omnivore.omnivore.networking

import app.omnivore.omnivore.graphql.generated.GetArticleQuery
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.persistence.entities.Highlight

data class SavedItemQueryResponse(
  val item: SavedItem?,
  val highlights: List<Highlight>,
  val labels: List<SavedItemLabel>,
  val state: String
) {
  companion object {
    fun emptyResponse(): SavedItemQueryResponse {
      return SavedItemQueryResponse(null, listOf(), listOf(), state = "")
    }
  }
}

suspend fun Networker.savedItem(slug: String): SavedItemQueryResponse {
  try {
    val result = authenticatedApolloClient().query(
      GetArticleQuery(slug = slug)
    ).execute()

    val article = result.data?.article?.onArticleSuccess?.article
      ?: return SavedItemQueryResponse.emptyResponse()

    val labels = article.labels ?: listOf()

    val savedItemLabels = labels.map {
      SavedItemLabel(
        savedItemLabelId = it.labelFields.id,
        name = it.labelFields.name,
        color = it.labelFields.color,
        createdAt = it.labelFields.createdAt as String?,
        labelDescription = it.labelFields.description
      )
    }

    val highlights = article.highlights.map {
//      val updatedAtString = it.highlightFields.updatedAt as? String

      Highlight(
        highlightId = it.highlightFields.id,
        shortId = it.highlightFields.shortId,
        quote = it.highlightFields.quote,
        prefix = it.highlightFields.prefix,
        suffix = it.highlightFields.suffix,
        patch = it.highlightFields.patch,
        annotation = it.highlightFields.annotation,
        createdAt = null, // TODO: update gql query to get this
        updatedAt = null, //updatedAtString?.let { str -> LocalDate.parse(str) }, TODO: fix date parsing
        createdByMe = it.highlightFields.createdByMe
      )
    }

    // TODO: handle errors

    val savedItem = SavedItem(
      savedItemId = article.articleFields.id,
      title = article.articleFields.title,
      createdAt = article.articleFields.createdAt as String,
      savedAt = article.articleFields.savedAt as String,
      readAt = article.articleFields.readAt as String?,
      updatedAt = article.articleFields.updatedAt as String?,
      readingProgress = article.articleFields.readingProgressPercent,
      readingProgressAnchor = article.articleFields.readingProgressAnchorIndex,
      imageURLString = article.articleFields.image,
      pageURLString = article.articleFields.url,
      descriptionText = article.articleFields.description,
      publisherURLString = article.articleFields.originalArticleUrl,
      siteName = article.articleFields.siteName,
      author = article.articleFields.author,
      publishDate = article.articleFields.publishedAt as String?,
      slug = article.articleFields.slug,
      isArchived = article.articleFields.isArchived,
      contentReader = article.articleFields.contentReader.rawValue,
      content = article.articleFields.content
    )

    return SavedItemQueryResponse(item = savedItem, highlights, labels = savedItemLabels, state = article.articleFields.state?.rawValue ?: "")
  } catch (e: java.lang.Exception) {
    return SavedItemQueryResponse(item = null, listOf(), labels = listOf(), state = "")
  }
}
