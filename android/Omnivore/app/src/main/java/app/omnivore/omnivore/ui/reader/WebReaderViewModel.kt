package app.omnivore.omnivore.ui.reader

import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.Constants
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.graphql.generated.GetArticleQuery
import app.omnivore.omnivore.models.Highlight
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.models.LinkedItemLabel
import com.apollographql.apollo3.ApolloClient
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
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

      val articleContent = ArticleContent(
        title = article.articleFields.title,
        htmlContent = article.articleFields.content ?: "",
        highlightsJSONString = Gson().toJson(highlights),
        contentStatus = "SUCCEEDED",
        objectID = "",
        labelsJSONString = Gson().toJson(linkedItemLabels)
      )

      webReaderParamsLiveData.value = WebReaderParams(linkedItem, articleContent)
    }
  }

  fun handleIncomingWebMessage(actionID: String, json: JSONObject) {
    when (actionID) {
      "createHighlight" -> {
        Log.d("Loggo", "receive create highlight action: $json")
      }
      "deleteHighlight" -> {
        // { highlightId }
        Log.d("Loggo", "receive delete highlight action: $json")
      }
      "updateHighlight" -> {
        Log.d("Loggo", "receive update highlight action: $json")
      }
      "articleReadingProgress" -> {
        Log.d("Loggo", "received article reading progress action: $json")
      }
      "annotate" -> {
        Log.d("Loggo", "received annotate action: $json")
      }
      "existingHighlightTap" -> {
        Log.d("Loggo", "receive create highlight action: $json")
      }
      "shareHighlight" -> {
        // unimplemented
      }
      else -> {
        Log.d("Loggo", "receive unrecognized action of $actionID with json: $json")
      }
    }
  }

  fun reset() {
    webReaderParamsLiveData.value = null
  }
}
