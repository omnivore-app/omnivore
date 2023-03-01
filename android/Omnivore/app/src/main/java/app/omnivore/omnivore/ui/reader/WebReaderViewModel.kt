package app.omnivore.omnivore.ui.reader

import android.util.Log
import androidx.compose.foundation.ScrollState
import androidx.compose.runtime.remember
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
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
  var maxToolbarHeightPx = 0.0f

  val webReaderParamsLiveData = MutableLiveData<WebReaderParams?>(null)
  val annotationLiveData = MutableLiveData<String?>(null)
  val javascriptActionLoopUUIDLiveData = MutableLiveData(lastJavascriptActionLoopUUID)
  val shouldPopViewLiveData = MutableLiveData(false)
  val hasFetchError = MutableLiveData(false)
  val currentToolbarHeightLiveData = MutableLiveData(0.0f)

  var hasTappedExistingHighlight = false
  var lastTapCoordinates: TapCoordinates? = null
  private var isLoading = false
  
  fun loadItem(slug: String?, requestID: String?) {
    if (isLoading || webReaderParamsLiveData.value != null) { return }
    isLoading = true
    Log.d("reader", "load item called")

    viewModelScope.launch {
      slug?.let { loadItemUsingSlug(it) }
      requestID?.let { loadItemUsingRequestID(it) }
    }
  }

  fun showNavBar() {
    onScrollChange(maxToolbarHeightPx)
  }

  fun onScrollChange(delta: Float) {
    val newHeight = (currentToolbarHeightLiveData.value ?: 0.0f) + delta
    currentToolbarHeightLiveData.value = newHeight.coerceIn(0f, maxToolbarHeightPx)
  }

  private suspend fun loadItemUsingSlug(slug: String) {
    val webReaderParams = loadItemFromServer(slug)

    if (webReaderParams != null) {
      Log.d("reader", "data loaded from server")
      webReaderParamsLiveData.postValue(webReaderParams)
      isLoading = false
    } else {
      loadItemFromDB(slug)
    }
  }

  private suspend fun loadItemUsingRequestID(requestID: String, requestCount: Int = 0) {
    val webReaderParams = loadItemFromServer(requestID)
    val isSuccessful = webReaderParams?.articleContent?.contentStatus == "SUCCEEDED"

    if (webReaderParams != null && isSuccessful) {
      webReaderParamsLiveData.postValue(webReaderParams)
      isLoading = false
    } else if (requestCount < 7) {
      // delay then try again
      delay(2000L)
      loadItemUsingRequestID(requestID = requestID, requestCount = requestCount + 1)
    } else {
      hasFetchError.postValue(true)
    }
  }

  private suspend fun loadItemFromDB(slug: String) {
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
      }
      isLoading = false
    }
  }

  private suspend fun loadItemFromServer(slug: String): WebReaderParams? {
    val articleQueryResult = networker.savedItem(slug)

    val article = articleQueryResult.item ?: return null

    val articleContent = ArticleContent(
      title = article.title,
      htmlContent = article.content ?: "",
      highlights = articleQueryResult.highlights,
      contentStatus = articleQueryResult.state,
      objectID = "",
      labelsJSONString = Gson().toJson(articleQueryResult.labels)
    )

    return WebReaderParams(article, articleContent)
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
      SavedItemAction.EditLabels -> {
        Log.d("label", "itemID")
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
