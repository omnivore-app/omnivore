package app.omnivore.omnivore.ui.reader

import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.createHighlight
import app.omnivore.omnivore.networking.linkedItem
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import org.json.JSONObject
import javax.inject.Inject

data class WebReaderParams(
  val item: LinkedItem,
  val articleContent: ArticleContent
)

@HiltViewModel
class WebReaderViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository,
  private val networker: Networker
): ViewModel() {
  val webReaderParamsLiveData = MutableLiveData<WebReaderParams?>(null)

  fun loadItem(slug: String) {
    viewModelScope.launch {
      val articleQueryResult = networker.linkedItem(slug)

      val article = articleQueryResult.item ?: return@launch

      val articleContent = ArticleContent(
        title = article.title,
        htmlContent = article.content ?: "",
        highlightsJSONString = Gson().toJson(articleQueryResult.highlights),
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
          networker.createHighlight(jsonString)
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
        Log.d("Loggo", "received article reading progress action: $jsonString")
      }
      "annotate" -> {
        Log.d("Loggo", "received annotate action: $jsonString")
      }
      "existingHighlightTap" -> {
        Log.d("Loggo", "receive existing highlight tap action: $jsonString")
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
  }
}
