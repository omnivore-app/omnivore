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
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.graphql.generated.type.SetLabelsInput
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.SavedItemAndSavedItemLabelCrossRef
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.library.SavedItemAction
import com.apollographql.apollo3.api.Optional
import com.apollographql.apollo3.api.Optional.Companion.presentIfNotNull
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import java.util.*
import javax.inject.Inject

data class WebReaderParams(
  val item: SavedItem,
  val articleContent: ArticleContent,
  val labels: List<SavedItemLabel>
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
  val showLabelsSelectionSheetLiveData = MutableLiveData(false)
  val savedItemLabelsLiveData = dataService.db.savedItemLabelDao().getSavedItemLabelsLiveData()

  // "Sepia", "Apollo",
  val systemThemeKeys = listOf("Light", "Black", "System")

  var hasTappedExistingHighlight = false
  var lastTapCoordinates: TapCoordinates? = null
  private var isLoading = false
  private var slug: String? = null
  
  fun loadItem(slug: String?, requestID: String?) {
    this.slug = slug
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
    loadItemFromDB(slug)

    val webReaderParams = loadItemFromServer(slug)

    if (webReaderParams != null) {
      Log.d("reader", "data loaded from server")
      webReaderParamsLiveData.postValue(webReaderParams)
      isLoading = false
    }
  }

  private suspend fun loadItemUsingRequestID(requestID: String, requestCount: Int = 0) {
    val webReaderParams = loadItemFromServer(requestID)
    val isSuccessful = webReaderParams?.articleContent?.contentStatus == "SUCCEEDED"

    if (webReaderParams != null && isSuccessful) {
      this.slug = webReaderParams.item.slug
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
        webReaderParamsLiveData.postValue(
          WebReaderParams(
            persistedItem.savedItem,
            articleContent,
            persistedItem.labels
          )
        )
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

    return WebReaderParams(article, articleContent, articleQueryResult.labels)
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
        showLabelsSelectionSheetLiveData.value = true
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
    val storedThemePreference = datastoreRepo.getString(DatastoreKeys.preferredTheme) ?: "System"
    val storedWebFont = WebFont.values().firstOrNull { it.rawValue == storedFontFamily } ?: WebFont.values().first()

    val prefersHighContrastFont = datastoreRepo.getString(DatastoreKeys.prefersWebHighContrastText) == "true"
    val prefersJustifyText = datastoreRepo.getString(DatastoreKeys.prefersJustifyText) == "true"

    WebPreferences(
      textFontSize = storedFontSize ?: 12,
      lineHeight = storedLineHeight ?: 150,
      maxWidthPercentage = storedMaxWidth ?: 100,
      themeKey = themeKey(isDarkMode, storedThemePreference),
      storedThemePreference = storedThemePreference,
      fontFamily = storedWebFont,
      prefersHighContrastText = prefersHighContrastFont,
      prefersJustifyText = prefersJustifyText
    )
  }

  fun themeKey(isDarkMode: Boolean, storedThemePreference: String): String {
    if (storedThemePreference == "System") {
      return if (isDarkMode) "Black" else "Light"
    }

    return storedThemePreference
  }

  fun updateStoredThemePreference(index: Int, isDarkMode: Boolean) {
    val newThemeKey = themeKey(isDarkMode, systemThemeKeys[index])
    Log.d("theme", "Setting theme key: ${newThemeKey}")

    runBlocking {
      datastoreRepo.putString(DatastoreKeys.preferredTheme, systemThemeKeys[index])
    }

    val script = "var event = new Event('updateTheme');event.themeName = '$newThemeKey';document.dispatchEvent(event);"
    enqueueScript(script)
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

  fun updateJustifyText(justifyText: Boolean) {
    runBlocking {
      datastoreRepo.putString(DatastoreKeys.prefersJustifyText, justifyText.toString())
    }
    val script = "var event = new Event('updateJustifyText');event.justifyText = $justifyText;document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun applyWebFont(font: WebFont) {
    runBlocking {
      datastoreRepo.putString(DatastoreKeys.preferredWebFontFamily, font.rawValue)
    }

    val script = "var event = new Event('updateFontFamily');event.fontFamily = '${font.rawValue}';document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun updateSavedItemLabels(savedItemID: String, labels: List<SavedItemLabel>) {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {
        val input = SetLabelsInput(labelIds = labels.map { it.savedItemLabelId }, pageId = savedItemID)
        val networkResult = networker.updateLabelsForSavedItem(input)

        // TODO: assign a server sync status to these
        val crossRefs = labels.map {
          SavedItemAndSavedItemLabelCrossRef(
            savedItemLabelId = it.savedItemLabelId,
            savedItemId = savedItemID
          )
        }

        // Remove all labels first
        dataService.db.savedItemAndSavedItemLabelCrossRefDao().deleteRefsBySavedItemId(savedItemID)

        // Add back the current labels
        dataService.db.savedItemAndSavedItemLabelCrossRefDao().insertAll(crossRefs)

        slug?.let {
          loadItemFromDB(it)
        }

        // Send labels to webview
        val script = "var event = new Event('updateLabels');event.labels = ${Gson().toJson(labels)};document.dispatchEvent(event);"
        CoroutineScope(Dispatchers.Main).launch {
          enqueueScript(script)
        }
      }
    }
  }

  fun createNewSavedItemLabel(labelName: String, hexColorValue: String) {
    viewModelScope.launch {
      withContext(Dispatchers.IO) {

        val newLabel = networker.createNewLabel(CreateLabelInput(color = Optional.presentIfNotNull(hexColorValue), name = labelName))

        newLabel?.let {
          val savedItemLabel = SavedItemLabel(
            savedItemLabelId = it.id,
            name = it.name,
            color = it.color,
            createdAt = it.createdAt as String?,
            labelDescription = it.description
          )

          dataService.db.savedItemLabelDao().insertAll(listOf(savedItemLabel))
        }
      }
    }
  }
}
