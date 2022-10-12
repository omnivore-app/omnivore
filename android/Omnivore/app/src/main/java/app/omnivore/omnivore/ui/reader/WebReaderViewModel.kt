package app.omnivore.omnivore.ui.reader

import android.util.Log
import androidx.compose.foundation.ScrollState
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.networking.*
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.*
import javax.inject.Inject

data class WebReaderParams(
  val item: LinkedItem,
  val articleContent: ArticleContent
)

data class AnnotationWebViewMessage(
  val annotation: String?
)

@HiltViewModel
class WebReaderViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository,
  private val networker: Networker
): ViewModel() {
  var lastJavascriptActionLoopUUID = UUID.randomUUID()
  var javascriptDispatchQueue: MutableList<String> = mutableListOf()
  var scrollState = ScrollState(0)

  val webReaderParamsLiveData = MutableLiveData<WebReaderParams?>(null)
  val annotationLiveData = MutableLiveData<String?>(null)
  val javascriptActionLoopUUIDLiveData = MutableLiveData(lastJavascriptActionLoopUUID)

  fun loadItem(slug: String) {
    viewModelScope.launch {
      val articleQueryResult = networker.linkedItem(slug)

      val article = articleQueryResult.item ?: return@launch

      val articleContent = ArticleContent(
        title = article.title,
        htmlContent = article.content ?: "",
        highlights = articleQueryResult.highlights,
        contentStatus = "SUCCEEDED",
        objectID = "",
        labelsJSONString = Gson().toJson(articleQueryResult.labels)
      )

      webReaderParamsLiveData.value = WebReaderParams(article, articleContent)
    }
  }

  fun handleIncomingWebMessage(actionID: String, jsonString: String) {
    when (actionID) {
      "createHighlight" -> {
        viewModelScope.launch {
          val isHighlightSynced = networker.createHighlight(jsonString)
          Log.d("Network", "isHighlightSynced = $isHighlightSynced")
        }
      }
      "deleteHighlight" -> {
        // { highlightId }
        Log.d("Loggo", "receive delete highlight action: $jsonString")
      }
      "updateHighlight" -> {
        Log.d("Loggo", "receive update highlight action: $jsonString")
      }
      "articleReadingProgress" -> {
        viewModelScope.launch {
          val isReadingProgressSynced = networker.updateReadingProgress(jsonString)
          Log.d("Network", "isReadingProgressSynced = $isReadingProgressSynced")
        }
      }
      "annotate" -> {
        viewModelScope.launch {
          val annotation = Gson()
            .fromJson(jsonString, AnnotationWebViewMessage::class.java)
            .annotation ?: ""
          annotationLiveData.value = annotation
        }
      }
      "shareHighlight" -> {
        // unimplemented
      }
      else -> {
        Log.d("Loggo", "receive unrecognized action of $actionID with json: $jsonString")
      }
    }
  }

  fun reset() {
    webReaderParamsLiveData.value = null
    annotationLiveData.value = null
    scrollState = ScrollState(0)
    javascriptDispatchQueue = mutableListOf()
  }

  fun resetJavascriptDispatchQueue() {
    lastJavascriptActionLoopUUID = javascriptActionLoopUUIDLiveData.value
    javascriptDispatchQueue = mutableListOf()
  }

  fun saveAnnotation(annotation: String) {
    val script = "var event = new Event('saveAnnotation');event.annotation = '$annotation';document.dispatchEvent(event);"
    javascriptDispatchQueue.add(script)
    javascriptActionLoopUUIDLiveData.value = UUID.randomUUID()
    cancelAnnotationEdit()
  }

  fun cancelAnnotationEdit() {
    annotationLiveData.value = null
  }
}
