package app.omnivore.omnivore.ui.reader

import android.util.Log
import androidx.compose.foundation.ScrollState
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.dataService.*
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.ui.library.SavedItemAction
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import java.util.*
import javax.inject.Inject

data class WebReaderParams(
  val item: SavedItem,
  val articleContent: ArticleContent
)

data class AnnotationWebViewMessage(
  val annotation: String?
)

@HiltViewModel
class WebReaderViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository,
  private val dataService: DataService,
  private val networker: Networker
): ViewModel() {
  var lastJavascriptActionLoopUUID: UUID = UUID.randomUUID()
  var javascriptDispatchQueue: MutableList<String> = mutableListOf()
  var scrollState = ScrollState(0)
  var currentToolbarHeight = 0

  val webReaderParamsLiveData = MutableLiveData<WebReaderParams?>(null)
  val annotationLiveData = MutableLiveData<String?>(null)
  val javascriptActionLoopUUIDLiveData = MutableLiveData(lastJavascriptActionLoopUUID)
  val shouldPopViewLiveData = MutableLiveData<Boolean>(false)

  var hasTappedExistingHighlight = false
  var lastTapCoordinates: TapCoordinates? = null

  fun loadItem(slug: String) {
    viewModelScope.launch {
      // Attempt to load from db first
      withContext(Dispatchers.IO) {
        val persistedItem = dataService.db.savedItemDao().getSavedItemWithLabelsAndHighlights(slug)

        if (persistedItem?.savedItem?.content != null) {
          val articleContent = ArticleContent(
            title = persistedItem.savedItem.title,
            htmlContent = persistedItem.savedItem.content,
            highlights = persistedItem.highlights,
            contentStatus = "SUCCEEDED",
            objectID = "",
            labelsJSONString = Gson().toJson(persistedItem.labels)
          )

          Log.d("sync", "data loaded from db")
          webReaderParamsLiveData.postValue(WebReaderParams(persistedItem.savedItem, articleContent))
        } else {
          loadItemFromServer(slug)
        }
      }
    }
  }

  private suspend fun loadItemFromServer(slug: String) {
    val articleQueryResult = networker.savedItem(slug)

    val article = articleQueryResult.item ?: return

    val articleContent = ArticleContent(
      title = article.title,
      htmlContent = article.content ?: "",
      highlights = articleQueryResult.highlights,
      contentStatus = "SUCCEEDED",
      objectID = "",
      labelsJSONString = Gson().toJson(articleQueryResult.labels)
    )

    Log.d("sync", "data loaded from server")
    webReaderParamsLiveData.postValue(WebReaderParams(article, articleContent))
  }

  fun handleSavedItemAction(itemID: String, action: SavedItemAction) {
    when (action) {
      SavedItemAction.Delete -> {
        viewModelScope.launch {
          dataService.deleteSavedItem(itemID)
          popToLibraryView()
        }
      }
      SavedItemAction.Archive -> {
        viewModelScope.launch {
          dataService.archiveSavedItem(itemID)
          popToLibraryView()
        }
      }
      SavedItemAction.Unarchive -> {
        viewModelScope.launch {
          dataService.unarchiveSavedItem(itemID)
          popToLibraryView()
        }
      }
    }
  }

  private fun popToLibraryView() {
    CoroutineScope(Dispatchers.Main).launch {
      shouldPopViewLiveData.postValue(true)
    }
  }

  fun handleIncomingWebMessage(actionID: String, jsonString: String) {
    when (actionID) {
      "createHighlight" -> {
        viewModelScope.launch {
          dataService.createWebHighlight(jsonString)
        }
      }
      "deleteHighlight" -> {
        Log.d("Loggo", "receive delete highlight action: $jsonString")
        viewModelScope.launch {
          dataService.deleteHighlights(jsonString)
        }
      }
      "updateHighlight" -> {
        Log.d("Loggo", "receive update highlight action: $jsonString")
        viewModelScope.launch {
          dataService.updateWebHighlight(jsonString)
        }
      }
      "articleReadingProgress" -> {
        viewModelScope.launch {
          dataService.updateWebReadingProgress(jsonString)
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
      "mergeHighlight" -> {
        viewModelScope.launch {
          dataService.mergeWebHighlights(jsonString)
        }
      }
      else -> {
        Log.d("Loggo", "receive unrecognized action of $actionID with json: $jsonString")
      }
    }
  }

  fun reset() {
    shouldPopViewLiveData.postValue(false)
    webReaderParamsLiveData.value = null
    annotationLiveData.value = null
    scrollState = ScrollState(0)
    javascriptDispatchQueue = mutableListOf()
    hasTappedExistingHighlight = false
    lastTapCoordinates = null
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

  fun storedWebPreferences(isDarkMode: Boolean): WebPreferences = runBlocking {
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
      themeKey = if (isDarkMode) "Gray" else "LightGray",
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
