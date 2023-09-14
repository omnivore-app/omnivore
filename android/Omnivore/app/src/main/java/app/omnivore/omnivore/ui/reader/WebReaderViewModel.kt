package app.omnivore.omnivore.ui.reader

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.core.content.ContextCompat.startActivity
import androidx.lifecycle.*
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.EventTracker
import app.omnivore.omnivore.dataService.*
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.graphql.generated.type.SetLabelsInput
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.SavedItem
import app.omnivore.omnivore.persistence.entities.SavedItemAndSavedItemLabelCrossRef
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.library.SavedItemAction
import com.apollographql.apollo3.api.Optional
import com.apollographql.apollo3.api.Optional.Companion.presentIfNotNull
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.distinctUntilChanged
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

enum class Themes(val themeKey: String, val backgroundColor: Long, val foregroundColor: Long) {
  SYSTEM("System", 0xFF000000, 0xFF000000),
  LIGHT("Light", 0xFFFFFFFF, 0xFF000000),
  SEPIA("Sepia", 0xFFFBF0D9, 0xFF000000),
  DARK("Dark", 0xFF2F3030, 0xFFFFFFFF),
  APOLLO("Apollo", 0xFF6A6968, 0xFFFFFFFF),
  BLACK("Black", 0xFF000000, 0xFFFFFFFF),
}

@HiltViewModel
class WebReaderViewModel @Inject constructor(
  private val datastoreRepo: DatastoreRepository,
  private val dataService: DataService,
  private val networker: Networker,
  private val eventTracker: EventTracker,
): ViewModel() {
  var lastJavascriptActionLoopUUID: UUID = UUID.randomUUID()
  var javascriptDispatchQueue: MutableList<String> = mutableListOf()
  var maxToolbarHeightPx = 0.0f

  val webReaderParamsLiveData = MutableLiveData<WebReaderParams?>(null)
  var annotation: String? = null
  val javascriptActionLoopUUIDLiveData = MutableLiveData(lastJavascriptActionLoopUUID)
  val shouldPopViewLiveData = MutableLiveData(false)
  val hasFetchError = MutableLiveData(false)
  val currentToolbarHeightLiveData = MutableLiveData(0.0f)
  val savedItemLabelsLiveData = dataService.db.savedItemLabelDao().getSavedItemLabelsLiveData()

  var currentLink: Uri? = null
  val bottomSheetStateLiveData = MutableLiveData<BottomSheetState>(BottomSheetState.NONE)

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

  fun setBottomSheet(state: BottomSheetState) {
    bottomSheetStateLiveData.postValue(state)
  }

  fun resetBottomSheet() {
    bottomSheetStateLiveData.postValue(BottomSheetState.NONE)
  }

  fun showOpenLinkSheet(context: Context, uri: Uri) {
    webReaderParamsLiveData.value?.let {
      if (it.item.pageURLString == uri.toString()) {
        openLink(context, uri)
      } else {
        currentLink = uri
        bottomSheetStateLiveData.postValue(BottomSheetState.LINK)
      }
    }
  }

  fun showShareLinkSheet(context: Context) {
    webReaderParamsLiveData.value?.let {
      val browserIntent = Intent(Intent.ACTION_SEND)

      browserIntent.setType("text/plain")
      browserIntent.putExtra(Intent.EXTRA_TEXT, it.item.pageURLString)
      browserIntent.putExtra(Intent.EXTRA_SUBJECT, it.item.pageURLString)
      context.startActivity(browserIntent)
    }
  }

  fun openCurrentLink(context: Context) {
    currentLink?.let {
      openLink(context, it)
    }
    bottomSheetStateLiveData.postValue(BottomSheetState.NONE)
  }

  fun openLink(context: Context, uri: Uri) {
    val browserIntent = Intent(Intent.ACTION_VIEW, uri)
    startActivity(context, browserIntent, null)
  }

  fun saveCurrentLink(context: Context) {
    currentLink?.let {
      viewModelScope.launch {
        val success = networker.saveUrl(it)
        Toast.makeText(context, if (success) "Link saved" else "Error saving link" , Toast.LENGTH_SHORT).show()
      }
    }
    bottomSheetStateLiveData.postValue(BottomSheetState.NONE)
  }

  fun copyCurrentLink(context: Context) {
    currentLink?.let {
      val clip = ClipData.newPlainText("link", it.toString())
      val clipboard =
        context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      clipboard.setPrimaryClip(clip)
      clipboard?.let {
        clipboard?.setPrimaryClip(clip)
        Toast.makeText(context, "Link Copied", Toast.LENGTH_SHORT).show()
      }
    }
    bottomSheetStateLiveData.postValue(BottomSheetState.NONE)
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
      eventTracker.track("link_read",
        com.posthog.android.Properties()
          .putValue("linkID", webReaderParams.item.savedItemId)
          .putValue("slug", webReaderParams.item.slug)
          .putValue("originalArticleURL", webReaderParams.item.pageURLString)
          .putValue("loaded_from", "network")
      )
      webReaderParamsLiveData.postValue(webReaderParams)
      isLoading = false
    }
  }

  private suspend fun loadItemUsingRequestID(requestID: String, requestCount: Int = 0) {
    val webReaderParams = loadItemFromServer(requestID)
    val isSuccessful = webReaderParams?.articleContent?.contentStatus == "SUCCEEDED"

    if (webReaderParams != null && isSuccessful) {
      this.slug = webReaderParams.item.slug
      eventTracker.track("link_read",
        com.posthog.android.Properties()
          .putValue("linkID", webReaderParams.item.savedItemId)
          .putValue("slug", webReaderParams.item.slug)
          .putValue("originalArticleURL", webReaderParams.item.pageURLString)
          .putValue("loaded_from", "request_id")
      )
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

        val webReaderParams = WebReaderParams(
          persistedItem.savedItem,
          articleContent,
          persistedItem.labels
        )

        Log.d("sync", "data loaded from db")
        eventTracker.track("link_read",
          com.posthog.android.Properties()
            .putValue("linkID", webReaderParams.item.savedItemId)
            .putValue("slug", webReaderParams.item.slug)
            .putValue("originalArticleURL", webReaderParams.item.pageURLString)
            .putValue("loaded_from", "db")
        )
        webReaderParamsLiveData.postValue(webReaderParams)
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
        bottomSheetStateLiveData.postValue(BottomSheetState.LABELS)
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
          val annotationStr = Gson()
            .fromJson(jsonString, AnnotationWebViewMessage::class.java)
            .annotation ?: ""
          annotation = annotationStr
          bottomSheetStateLiveData.postValue(BottomSheetState.HIGHLIGHTNOTE)
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
    val jsonAnnotation = Gson().toJson(annotation)
    val script = "var event = new Event('saveAnnotation');event.annotation = $jsonAnnotation;document.dispatchEvent(event);"

    Log.d("loggo", script)

    enqueueScript(script)
    cancelAnnotationEdit()
  }

  fun cancelAnnotation() {
    val script = "var event = new Event('dismissHighlight');document.dispatchEvent(event);"

    enqueueScript(script)
    cancelAnnotationEdit()
  }

  fun cancelAnnotationEdit() {
    annotation = null
    resetBottomSheet()
  }

  private fun enqueueScript(javascript: String) {
    javascriptDispatchQueue.add(javascript)
    javascriptActionLoopUUIDLiveData.value = UUID.randomUUID()
  }

  val currentThemeKey: LiveData<String> = datastoreRepo
    .themeKeyFlow
    .distinctUntilChanged()
    .asLiveData()

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

  fun updateStoredThemePreference(newThemeKey: String, isDarkMode: Boolean) {
    Log.d("theme", "Setting theme key: ${newThemeKey}")

    runBlocking {
      datastoreRepo.putString(DatastoreKeys.preferredTheme, newThemeKey)
    }

    val script = "var event = new Event('updateTheme');event.themeName = '$newThemeKey';document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun setFontSize(newFontSize: Int)  {
    runBlocking {
      datastoreRepo.putInt(DatastoreKeys.preferredWebFontSize, newFontSize)
    }
    val script = "var event = new Event('updateFontSize');event.fontSize = '$newFontSize';document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun setMaxWidthPercentage(newMaxWidthPercentageValue: Int)  {
    runBlocking {
      datastoreRepo.putInt(DatastoreKeys.preferredWebMaxWidthPercentage, newMaxWidthPercentageValue)
    }
    val script = "var event = new Event('updateMaxWidthPercentage');event.maxWidthPercentage = '$newMaxWidthPercentageValue';document.dispatchEvent(event);"
    enqueueScript(script)
  }

  fun setLineHeight(newLineHeight: Int)  {
    runBlocking {
      datastoreRepo.putInt(DatastoreKeys.preferredWebLineHeight, newLineHeight)
    }
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
        val namedLabels = dataService.db.savedItemLabelDao().namedLabels(labels.map { it.name })

        namedLabels.filter { it.serverSyncStatus != ServerSyncStatus.IS_SYNCED.rawValue }.mapNotNull {
          val result = networker.createNewLabel(CreateLabelInput(color = presentIfNotNull(it.color), name = it.name))
          result?.let { it1 ->
            SavedItemLabel(
              savedItemLabelId = it1.id,
              name = result.name,
              color = result.color,
              createdAt = result.createdAt.toString(),
              labelDescription = result.description,
              serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            )
          }
        }

        val input = SetLabelsInput(labelIds = Optional.presentIfNotNull(namedLabels.map { it.savedItemLabelId }), pageId = savedItemID)
        val networkResult = networker.updateLabelsForSavedItem(input)

        // TODO: assign a server sync status to these
        val crossRefs = namedLabels.map {
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

        val newLabel = networker.createNewLabel(CreateLabelInput(color = presentIfNotNull(hexColorValue), name = labelName))

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
