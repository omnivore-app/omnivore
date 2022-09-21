package app.omnivore.omnivore.ui.reader

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.Constants
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.graphql.generated.GetArticleQuery
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.models.LinkedItemLabel
import com.apollographql.apollo3.ApolloClient
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

data class WebReaderParams(
  val item: LinkedItem,
  val articleContent: ArticleContent
)

@HiltViewModel
class WebReaderViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository
): ViewModel() {
  val webReaderParamsLiveData = MutableLiveData<WebReaderParams?>(null)

  private fun getAuthToken(): String? = runBlocking {
    datastoreRepo.getString(DatastoreKeys.omnivoreAuthToken)
  }

  fun loadItem(slug: String) {
    viewModelScope.launch {
      val authToken = getAuthToken()

      val apolloClient = ApolloClient.Builder()
        .serverUrl("${Constants.apiURL}/api/graphql")
        .addHttpHeader("Authorization", value = authToken ?: "")
        .build()

      val response = apolloClient.query(
        GetArticleQuery(slug = slug)
      ).execute()

      val article = response.data?.article?.onArticleSuccess?.article ?: return@launch

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

      val articleContent = ArticleContent(
        title = article.articleFields.title,
        htmlContent = article.articleFields.content ?: "",
        highlightsJSONString = "[]",
        contentStatus = "SUCCEEDED",
        objectID = "",
        labelsJSONString = Gson().toJson(linkedItemLabels)
      )

      webReaderParamsLiveData.value = WebReaderParams(linkedItem, articleContent)
    }
  }

  fun reset() {
    webReaderParamsLiveData.value = null
  }
}

// TODO: add labels and highlights values
