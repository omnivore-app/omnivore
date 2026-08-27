package app.omnivore.omnivore.core.network

import app.omnivore.omnivore.graphql.generated.GetDiscoverFeedArticlesQuery
import app.omnivore.omnivore.graphql.generated.GetDiscoverFeedsQuery
import app.omnivore.omnivore.graphql.generated.SaveDiscoverArticleMutation
import app.omnivore.omnivore.graphql.generated.type.SaveDiscoverArticleInput
import com.apollographql.apollo3.api.Optional
import java.net.URI
import java.util.TimeZone

data class DiscoverFeed(
  val id: String,
  val visibleName: String?,
  val title: String,
  val link: String,
  val description: String?,
  val image: String?,
  val type: String?
)

data class DiscoverFeedArticle(
  val id: String,
  val feed: String,
  val title: String,
  val url: String,
  val author: String?,
  val description: String,
  val image: String?,
  val publishedDate: String?,
  val siteName: String?,
  val slug: String,
  val savedId: String?,
  val savedLinkUrl: String?,
  val hidden: Boolean?
)

data class DiscoverArticlesResult(
  val articles: List<DiscoverFeedArticle>,
  val hasMore: Boolean,
  val cursor: String?,
  val error: Boolean
)

suspend fun Networker.getDiscoverFeeds(): List<DiscoverFeed> {
  return try {
    val result = authenticatedApolloClient().query(GetDiscoverFeedsQuery()).execute()
    result.data?.discoverFeeds?.onDiscoverFeedSuccess?.feeds?.filterNotNull()?.map {
      DiscoverFeed(
        id = it.id,
        visibleName = it.visibleName,
        title = it.title,
        link = it.link,
        description = it.description,
        image = it.image,
        type = it.type
      )
    } ?: listOf()
  } catch (e: Exception) {
    listOf()
  }
}

suspend fun Networker.getDiscoverFeedArticles(
  after: String? = null,
  discoverTopicId: String,
  feedId: String? = null,
  first: Int = 10,
  showHidden: Boolean = true
): DiscoverArticlesResult {
  return try {
    val result = authenticatedApolloClient().query(
      GetDiscoverFeedArticlesQuery(
        after = Optional.presentIfNotNull(after),
        discoverTopicId = discoverTopicId,
        feedId = Optional.presentIfNotNull(feedId),
        first = Optional.presentIfNotNull(first),
        showHidden = Optional.presentIfNotNull(showHidden)
      )
    ).execute()

    val success = result.data?.getDiscoverFeedArticles?.onGetDiscoverFeedArticleSuccess
    val articles = success?.discoverArticles?.filterNotNull()?.map {
      DiscoverFeedArticle(
        id = it.id,
        feed = it.feed,
        title = it.title,
        url = it.url,
        author = it.author,
        description = it.description,
        image = it.image,
        publishedDate = it.publishedDate as String?,
        siteName = URI(it.siteName).host?.replace(Regex("^www\\."), ""),
        slug = it.slug,
        savedId = it.savedId,
        savedLinkUrl = it.savedLinkUrl,
        hidden = it.hidden
      )
    } ?: listOf()
    val pageInfo = success?.pageInfo

    DiscoverArticlesResult(
      articles = articles,
      hasMore = pageInfo?.hasNextPage ?: false,
      cursor = pageInfo?.endCursor,
      error = false
    )
  } catch (e: Exception) {
    DiscoverArticlesResult(
      articles = listOf(),
      hasMore = false,
      cursor = null,
      error = true
    )
  }
}

suspend fun Networker.saveDiscoverArticle(
  discoverArticleId: String,
  locale: String? = null
): String? {
  return try {
    val timezone = TimeZone.getDefault().id
    val input = SaveDiscoverArticleInput(
      discoverArticleId = discoverArticleId,
      locale = Optional.presentIfNotNull(locale),
      timezone = Optional.presentIfNotNull(timezone)
    )
    val result = authenticatedApolloClient().mutation(SaveDiscoverArticleMutation(input)).execute()
    result.data?.saveDiscoverArticle?.onSaveDiscoverArticleSuccess?.saveId
  } catch (e: Exception) {
    null
  }
}
