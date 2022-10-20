package app.omnivore.omnivore.ui.reader

import android.util.Log
import androidx.compose.foundation.ScrollState
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.models.LinkedItem
import app.omnivore.omnivore.networking.*
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
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
  var lastJavascriptActionLoopUUID: UUID = UUID.randomUUID()
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
    lastJavascriptActionLoopUUID = javascriptActionLoopUUIDLiveData.value ?: UUID.randomUUID()
    javascriptDispatchQueue = mutableListOf()
  }

  fun saveAnnotation(annotation: String) {
    val script = "var event = new Event('saveAnnotation');event.annotation = '$annotation';document.dispatchEvent(event);"
    enqueueScript(script)
    cancelAnnotationEdit()
  }

  fun cancelAnnotationEdit() {
    annotationLiveData.value = null
  }

  private fun enqueueScript(javascript: String) {
    javascriptDispatchQueue.add(javascript)
    javascriptActionLoopUUIDLiveData.value = UUID.randomUUID()
  }

  fun storedWebPreferences(): WebPreferences = runBlocking {
    val storedFontSize = datastoreRepo.getInt(DatastoreKeys.preferredWebFontSize)
    val storedLineHeight = datastoreRepo.getInt(DatastoreKeys.preferredWebLineHeight)
    val storedMaxWidth = datastoreRepo.getInt(DatastoreKeys.preferredWebMaxWidthPercentage)

    val storedFontFamily = datastoreRepo.getString(DatastoreKeys.preferredWebFontFamily) ?: WebFont.SYSTEM.rawValue
    val storedWebFont = WebFont.values().first { it.rawValue == storedFontFamily }

    val prefersHighContrastFont = datastoreRepo.getString(DatastoreKeys.prefersWebHighContrastText) == "true"

    WebPreferences(
      textFontSize = storedFontSize ?: 12,
      lineHeight = storedLineHeight ?: 150,
      maxWidthPercentage = storedMaxWidth ?: 100,
      themeKey = "LightGray", // TODO: match system value
      fontFamily = storedWebFont,
      prefersHighContrastText = prefersHighContrastFont
    )
  }

  fun updateFontSize(isIncrease: Boolean)  {
    val delta = if (isIncrease) 2 else -2
    var newFontSize: Int

    runBlocking {
      val storedFontSize = datastoreRepo.getInt(DatastoreKeys.preferredWebFontSize)
      newFontSize = ((storedFontSize ?: 12) + delta).coerceIn(8, 28)
      datastoreRepo.putInt(DatastoreKeys.preferredWebFontSize, newFontSize)
    }

    // Get value from data store and then update it
    val script = "var event = new Event('updateFontSize');event.fontSize = '$newFontSize';document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun updateMaxWidthPercentage(isIncrease: Boolean)  {
    val delta = if (isIncrease) 10 else -10
    var newMaxWidthPercentageValue: Int

    runBlocking {
      val storedWidth = datastoreRepo.getInt(DatastoreKeys.preferredWebMaxWidthPercentage)
      newMaxWidthPercentageValue = ((storedWidth ?: 100) + delta).coerceIn(40, 100)
      datastoreRepo.putInt(DatastoreKeys.preferredWebMaxWidthPercentage, newMaxWidthPercentageValue)
    }

    // Get value from data store and then update it
    val script = "var event = new Event('updateMaxWidthPercentage');event.maxWidthPercentage = '$newMaxWidthPercentageValue';document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun updateLineSpacing(isIncrease: Boolean)  {
    val delta = if (isIncrease) 25 else -25
    var newLineHeight: Int

    runBlocking {
      val storedHeight = datastoreRepo.getInt(DatastoreKeys.preferredWebLineHeight)
      newLineHeight = ((storedHeight ?: 150) + delta).coerceIn(100, 300)
      datastoreRepo.putInt(DatastoreKeys.preferredWebLineHeight, newLineHeight)
    }

    // Get value from data store and then update it
    val script = "var event = new Event('updateLineHeight');event.lineHeight = '$newLineHeight';document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun updateHighContrastTextPreference(prefersHighContrastText: Boolean) {
    runBlocking {
      datastoreRepo.putString(DatastoreKeys.prefersWebHighContrastText, prefersHighContrastText.toString())
    }
    val fontContrastValue = if (prefersHighContrastText) "high" else "normal"
    val script = "var event = new Event('handleFontContrastChange');event.fontContrast = '$fontContrastValue';document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun applyWebFont(font: WebFont) {
    runBlocking {
      datastoreRepo.putString(DatastoreKeys.preferredWebFontFamily, font.rawValue)
    }

    val script = "var event = new Event('updateFontFamily');event.fontFamily = '${font.rawValue}';document.dispatchEvent(event);"
    enqueueScript(script)
  }
}
