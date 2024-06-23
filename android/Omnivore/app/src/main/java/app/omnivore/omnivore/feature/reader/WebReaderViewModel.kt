package app.omnivore.omnivore.feature.reader

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.core.content.ContextCompat.startActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.analytics.EventTracker
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.data.archiveSavedItem
import app.omnivore.omnivore.core.data.createWebHighlight
import app.omnivore.omnivore.core.data.deleteHighlightFromJSON
import app.omnivore.omnivore.core.data.deleteSavedItem
import app.omnivore.omnivore.core.data.mergeWebHighlights
import app.omnivore.omnivore.core.data.unarchiveSavedItem
import app.omnivore.omnivore.core.data.updateWebHighlight
import app.omnivore.omnivore.core.data.updateWebReadingProgress
import app.omnivore.omnivore.core.database.dao.SavedItemDao
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.datastore.DatastoreRepository
import app.omnivore.omnivore.core.datastore.preferredTheme
import app.omnivore.omnivore.core.datastore.preferredWebFontFamily
import app.omnivore.omnivore.core.datastore.preferredWebFontSize
import app.omnivore.omnivore.core.datastore.preferredWebLineHeight
import app.omnivore.omnivore.core.datastore.preferredWebMaxWidthPercentage
import app.omnivore.omnivore.core.datastore.prefersJustifyText
import app.omnivore.omnivore.core.datastore.prefersWebHighContrastText
import app.omnivore.omnivore.core.datastore.rtlText
import app.omnivore.omnivore.core.datastore.volumeForScroll
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.createNewLabel
import app.omnivore.omnivore.core.network.loadLibraryItemContent
import app.omnivore.omnivore.core.network.saveUrl
import app.omnivore.omnivore.core.network.savedItem
import app.omnivore.omnivore.feature.components.HighlightColor
import app.omnivore.omnivore.feature.library.SavedItemAction
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import com.apollographql.apollo3.api.Optional.Companion.presentIfNotNull
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.util.UUID
import javax.inject.Inject


data class WebReaderParams(
    val item: SavedItem,
    val articleContent: ArticleContent,
    val labels: List<SavedItemLabel>
)

data class AnnotationWebViewMessage(
    val annotation: String?
)

enum class Themes(
    val themeKey: String,
    val backgroundColor: Long,
    val foregroundColor: Long,
    val scrollbarColor: Long
) {
    SYSTEM("System", 0xFF000000, 0xFF000000, 0xFF3A3939),
    LIGHT("Light", 0xFFFFFFFF, 0xFF000000, 0xFF3A3939),
    SEPIA("Sepia", 0xFFFBF0D9, 0xFF000000, 0xFF5F4B32),
    DARK("Dark", 0xFF2F3030, 0xFFFFFFFF, 0xFFD8D7D7),
    APOLLO("Apollo", 0xFF6A6968, 0xFFFFFFFF, 0xFFF3F3F3),
    BLACK("Black", 0xFF000000, 0xFFFFFFFF, 0xFFFFFFFF),
}

@HiltViewModel
class WebReaderViewModel @Inject constructor(
    private val datastoreRepository: DatastoreRepository,
    private val dataService: DataService,
    private val networker: Networker,
    private val eventTracker: EventTracker,
    private val savedItemDao: SavedItemDao,
    @ApplicationContext private val applicationContext: Context
) : ViewModel() {
    var lastJavascriptActionLoopUUID: UUID = UUID.randomUUID()
    var javascriptDispatchQueue: MutableList<String> = mutableListOf()
    var maxToolbarHeightPx = 0.0f

    val webReaderParamsFlow = MutableStateFlow<WebReaderParams?>(null)
    var annotation: String? = null
    val javascriptActionLoopUUIDFlow = MutableStateFlow(lastJavascriptActionLoopUUID)
    val shouldPopViewFlow = MutableStateFlow(false)
    val hasFetchError = MutableStateFlow(false)
    val currentToolbarHeightFlow = MutableStateFlow(0.0f)
    val savedItemLabelsFlow = dataService.db.savedItemLabelDao().getSavedItemLabelsFlow()

    var currentLink: Uri? = null
    val bottomSheetStateFlow = MutableStateFlow(BottomSheetState.NONE)

    var hasTappedExistingHighlight = false
    var lastTapCoordinates: TapCoordinates? = null
    private var isLoading = false
    private var slug: String? = null

    private val showHighlightColorPalette = MutableStateFlow(false)
    val highlightColor = MutableStateFlow(HighlightColor())

    fun loadItem(slug: String?, requestID: String?) {
        this.slug = slug
        if (isLoading || webReaderParamsFlow.value != null) {
            return
        }
        isLoading = true
        Log.d("reader", "load item called")

        viewModelScope.launch {
            slug?.let { loadItemUsingSlug(it) }
            requestID?.let { loadItemUsingRequestID(it) }
        }
    }

    val rtlTextState: StateFlow<Boolean> = datastoreRepository.getBoolean(
        rtlText
    ).stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = false
    )

    fun showNavBar() {
        onScrollChange(maxToolbarHeightPx)
    }

    fun setBottomSheet(state: BottomSheetState) = viewModelScope.launch {
        bottomSheetStateFlow.update { state }
    }

    fun resetBottomSheet() = viewModelScope.launch {
        bottomSheetStateFlow.update { BottomSheetState.NONE }
    }

    fun showOpenLinkSheet(context: Context, uri: Uri) {
        webReaderParamsFlow.value?.let {
            if (it.item.pageURLString == uri.toString()) {
                openLink(context, uri)
            } else {
                currentLink = uri
                viewModelScope.launch {
                    bottomSheetStateFlow.update { BottomSheetState.LINK }
                }
            }
        }
    }

    fun showShareLinkSheet(context: Context) {
        webReaderParamsFlow.value?.let {
            val sendIntent = Intent(Intent.ACTION_SEND)

            sendIntent.setType("text/plain")
            sendIntent.putExtra(Intent.EXTRA_TEXT, it.item.pageURLString)
            sendIntent.putExtra(Intent.EXTRA_SUBJECT, it.item.title)
            val shareIntent = Intent.createChooser(sendIntent, null)
            context.startActivity(shareIntent)
        }
    }

    fun openCurrentLink(context: Context) {
        currentLink?.let {
            openLink(context, it)
        }
        viewModelScope.launch {
            bottomSheetStateFlow.update { BottomSheetState.NONE }
        }
    }

    private fun openLink(context: Context, uri: Uri) {
        val browserIntent = Intent(Intent.ACTION_VIEW, uri)
        startActivity(context, browserIntent, null)
    }

    fun saveCurrentLink(context: Context) = viewModelScope.launch {
        currentLink?.let {
            val success = networker.saveUrl(it)
            Toast.makeText(
                context,
                if (success)
                    context.getString(R.string.web_reader_view_model_save_link_success) else
                    context.getString(R.string.web_reader_view_model_save_link_error),
                Toast.LENGTH_SHORT
            ).show()
        }
        bottomSheetStateFlow.update { BottomSheetState.NONE }
    }

    fun copyCurrentLink(context: Context) {
        currentLink?.let {
            val clip = ClipData.newPlainText("link", it.toString())
            val clipboard =
                context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(clip)
            clipboard.let {
                clipboard.setPrimaryClip(clip)
                Toast.makeText(
                    context,
                    context.getString(R.string.web_reader_view_model_copy_link_success),
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
        bottomSheetStateFlow.update { BottomSheetState.NONE }
    }

    fun onScrollChange(delta: Float) {
        val newHeight = (currentToolbarHeightFlow.value) + delta
        currentToolbarHeightFlow.value = newHeight.coerceIn(0f, maxToolbarHeightPx)
    }

    private suspend fun loadItemUsingSlug(slug: String) {
        loadItemFromDB(slug)

        val webReaderParams = loadItemFromServer(slug)

        if (webReaderParams != null) {
            Log.d("reader", "data loaded from server")
            eventTracker.track(
                "link_read",
                com.posthog.android.Properties()
                    .putValue("linkID", webReaderParams.item.savedItemId)
                    .putValue("slug", webReaderParams.item.slug)
                    .putValue("originalArticleURL", webReaderParams.item.pageURLString)
                    .putValue("loaded_from", "network")
            )
            webReaderParamsFlow.update { webReaderParams }
            isLoading = false
        }
    }

    private suspend fun loadItemUsingRequestID(requestID: String, requestCount: Int = 0) {
        val webReaderParams = loadItemFromServer(requestID)
        val isSuccessful = webReaderParams?.articleContent?.contentStatus == "SUCCEEDED"

        if (webReaderParams != null && isSuccessful) {
            this.slug = webReaderParams.item.slug
            eventTracker.track(
                "link_read",
                com.posthog.android.Properties()
                    .putValue("linkID", webReaderParams.item.savedItemId)
                    .putValue("slug", webReaderParams.item.slug)
                    .putValue("originalArticleURL", webReaderParams.item.pageURLString)
                    .putValue("loaded_from", "request_id")
            )
            webReaderParamsFlow.update {  (webReaderParams) }
            isLoading = false
        } else if (requestCount < 7) {
            // delay then try again
            delay(2000L)
            loadItemUsingRequestID(requestID = requestID, requestCount = requestCount + 1)
        } else {
            hasFetchError.update { true }
        }
    }

    private suspend fun loadItemFromDB(slug: String) {
        withContext(Dispatchers.IO) {
            val persistedItem =
                dataService.db.savedItemDao().getSavedItemWithLabelsAndHighlights(slug)
            val savedItemId = persistedItem?.savedItem?.savedItemId
            if (savedItemId != null) {
                val htmlContent = loadLibraryItemContent(applicationContext, savedItemId)
                if (htmlContent != null) {
                    val articleContent = ArticleContent(
                        title = persistedItem.savedItem.title,
                        htmlContent = htmlContent,
                        highlights = persistedItem.highlights,
                        contentStatus = "SUCCEEDED",
                        labelsJSONString = Gson().toJson(persistedItem.labels)
                    )

                    val webReaderParams = WebReaderParams(
                        persistedItem.savedItem,
                        articleContent,
                        persistedItem.labels
                    )

                    Log.d("sync", "data loaded from db")
                    eventTracker.track(
                        "link_read",
                        com.posthog.android.Properties()
                            .putValue("linkID", webReaderParams.item.savedItemId)
                            .putValue("slug", webReaderParams.item.slug)
                            .putValue("originalArticleURL", webReaderParams.item.pageURLString)
                            .putValue("loaded_from", "db")
                    )
                    webReaderParamsFlow.update { webReaderParams }
                }
            }
            isLoading = false
        }
    }

    private suspend fun loadItemFromServer(slug: String): WebReaderParams? {
        val articleQueryResult = networker.savedItem(context = applicationContext, slug)

        val article = articleQueryResult.item ?: return null
        val htmlContent = loadLibraryItemContent(applicationContext, article.savedItemId)

        val articleContent = ArticleContent(
            title = article.title,
            htmlContent = htmlContent ?: "",
            highlights = articleQueryResult.highlights,
            contentStatus = articleQueryResult.state,
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
                bottomSheetStateFlow.update { BottomSheetState.LABELS }
            }

            SavedItemAction.EditInfo -> {
                bottomSheetStateFlow.update { BottomSheetState.EDIT_INFO }
            }

            SavedItemAction.MarkRead -> {
                // TODO
            }

            SavedItemAction.MarkUnread -> {
                // TODO
            }
        }
    }

    private fun popToLibraryView() = viewModelScope.launch {
            shouldPopViewFlow.update { true }
    }


    fun showHighlightColorPalette() = viewModelScope.launch {
            showHighlightColorPalette.update { true }
    }

    fun hideHighlightColorPalette() {
        CoroutineScope(Dispatchers.Main).launch {
            showHighlightColorPalette.update { false }
        }
    }

    fun handleIncomingWebMessage(actionID: String, jsonString: String) {
        Log.d("sync", "incoming change: ${actionID}: $jsonString")
        when (actionID) {
            "createHighlight" -> {
                viewModelScope.launch {
                    dataService.createWebHighlight(jsonString, highlightColor.value.name)
                }
            }

            "deleteHighlight" -> {
                viewModelScope.launch {
                    dataService.deleteHighlightFromJSON(jsonString)
                }
            }

            "updateHighlight" -> {
                viewModelScope.launch {
                    dataService.updateWebHighlight(jsonString)
                }
            }

            "articleReadingProgress" -> {
                viewModelScope.launch {
                    dataService.updateWebReadingProgress(jsonString, savedItemDao)
                }
            }

            "annotate" -> {
                viewModelScope.launch {
                    val annotationStr = Gson()
                        .fromJson(jsonString, AnnotationWebViewMessage::class.java)
                        .annotation ?: ""
                    annotation = annotationStr
                    bottomSheetStateFlow.update { BottomSheetState.HIGHLIGHTNOTE }
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
        lastJavascriptActionLoopUUID = javascriptActionLoopUUIDFlow.value
        javascriptDispatchQueue = mutableListOf()
    }

    fun saveAnnotation(annotation: String) = viewModelScope.launch {
        val jsonAnnotation = Gson().toJson(annotation)
        val script =
            "var event = new Event('saveAnnotation');event.annotation = $jsonAnnotation;document.dispatchEvent(event);"

        Log.d("loggo", script)

        enqueueScript(script)
        cancelAnnotationEdit()
    }

    fun cancelAnnotation() = viewModelScope.launch {
        val script = "var event = new Event('dismissHighlight');document.dispatchEvent(event);"

        enqueueScript(script)
        cancelAnnotationEdit()
    }

    private fun cancelAnnotationEdit() {
        annotation = null
        resetBottomSheet()
    }

    private fun enqueueScript(javascript: String) {
        javascriptDispatchQueue.add(javascript)
        javascriptActionLoopUUIDFlow.value = UUID.randomUUID()
    }

    val currentThemeKey: Flow<String> = datastoreRepository
        .themeKeyFlow
        .distinctUntilChanged()

    fun storedWebPreferences(isDarkMode: Boolean): WebPreferences = runBlocking {
        val storedFontSize = datastoreRepository.getInt(preferredWebFontSize)
        val storedLineHeight = datastoreRepository.getInt(preferredWebLineHeight)
        val storedMaxWidth = datastoreRepository.getInt(preferredWebMaxWidthPercentage)

        val storedFontFamily =
            datastoreRepository.getString(preferredWebFontFamily) ?: WebFont.SYSTEM.rawValue
        val storedThemePreference =
            datastoreRepository.getString(preferredTheme) ?: "System"
        val storedWebFont =
            WebFont.entries.firstOrNull { it.rawValue == storedFontFamily } ?: WebFont.entries
                .first()

        val prefersHighContrastFont =
            datastoreRepository.getString(prefersWebHighContrastText) == "true"
        val prefersJustifyText = datastoreRepository.getString(prefersJustifyText) == "true"

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

    fun updateStoredThemePreference(newThemeKey: String) {
        Log.d("theme", "Setting theme key: $newThemeKey")

        runBlocking {
            datastoreRepository.putString(preferredTheme, newThemeKey)
        }

        val script =
            "var event = new Event('updateTheme');event.themeName = '$newThemeKey';document.dispatchEvent(event);"
        enqueueScript(script)
    }

    fun setFontSize(newFontSize: Int) {
        runBlocking {
            datastoreRepository.putInt(preferredWebFontSize, newFontSize)
        }
        val script =
            "var event = new Event('updateFontSize');event.fontSize = '$newFontSize';document.dispatchEvent(event);"
        enqueueScript(script)
    }

    fun setMaxWidthPercentage(newMaxWidthPercentageValue: Int) {
        runBlocking {
            datastoreRepository.putInt(
                preferredWebMaxWidthPercentage,
                newMaxWidthPercentageValue
            )
        }
        val script =
            "var event = new Event('updateMaxWidthPercentage');event.maxWidthPercentage = '$newMaxWidthPercentageValue';document.dispatchEvent(event);"
        enqueueScript(script)
    }

    fun setLineHeight(newLineHeight: Int) {
        runBlocking {
            datastoreRepository.putInt(preferredWebLineHeight, newLineHeight)
        }
        val script =
            "var event = new Event('updateLineHeight');event.lineHeight = '$newLineHeight';document.dispatchEvent(event);"
        enqueueScript(script)
    }

    fun updateHighContrastTextPreference(prefersHighContrastText: Boolean) {
        runBlocking {
            datastoreRepository.putString(
                prefersWebHighContrastText,
                prefersHighContrastText.toString()
            )
        }
        val fontContrastValue = if (prefersHighContrastText) "high" else "normal"
        val script =
            "var event = new Event('handleFontContrastChange');event.fontContrast = '$fontContrastValue';document.dispatchEvent(event);"
        enqueueScript(script)
    }

    fun updateJustifyText(justifyText: Boolean) {
        runBlocking {
            datastoreRepository.putString(prefersJustifyText, justifyText.toString())
        }
        val script =
            "var event = new Event('updateJustifyText');event.justifyText = $justifyText;document.dispatchEvent(event);"
        enqueueScript(script)
    }

    val volumeRockerForScrollState: StateFlow<Boolean> = datastoreRepository.getBoolean(
        volumeForScroll
    ).stateIn(
        scope = viewModelScope,
        started = SharingStarted.Lazily,
        initialValue = false
    )

    fun setVolumeRockerForScrollState(value: Boolean) {
        viewModelScope.launch {
            datastoreRepository.putBoolean(volumeForScroll, value)
        }
    }

    fun setRtlTextState(value: Boolean) {
        viewModelScope.launch {
            datastoreRepository.putBoolean(rtlText, value)
        }
    }

    fun applyWebFont(font: WebFont) {
        runBlocking {
            datastoreRepository.putString(preferredWebFontFamily, font.rawValue)
        }

        val script =
            "var event = new Event('updateFontFamily');event.fontFamily = '${font.rawValue}';document.dispatchEvent(event);"
        enqueueScript(script)
    }

    fun updateSavedItemLabels(savedItemID: String, labels: List<SavedItemLabel>) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {

                setSavedItemLabels(
                    networker = networker,
                    dataService = dataService,
                    savedItemID = savedItemID,
                    labels = labels
                )

                slug?.let {
                    loadItemFromDB(it)
                }

                // Send labels to webview
                val script =
                    "var event = new Event('updateLabels');event.labels = ${Gson().toJson(labels)};document.dispatchEvent(event);"
                enqueueScript(script)
            }
        }
    }

    fun updateItemTitle() {
        viewModelScope.launch {
            slug?.let {
                loadItemFromDB(it)
            }

            webReaderParamsFlow.value?.item?.title?.let {
                updateItemTitleInWebView(it)
            }
        }
    }

    private fun updateItemTitleInWebView(title: String) {
        val script =
            "var event = new Event('updateTitle');event.title = '${title}';document.dispatchEvent(event);"
        CoroutineScope(Dispatchers.Main).launch {
            enqueueScript(script)
        }
    }

    fun createNewSavedItemLabel(labelName: String, hexColorValue: String) {
        viewModelScope.launch {
            withContext(Dispatchers.IO) {

                val newLabel = networker.createNewLabel(
                    CreateLabelInput(
                        color = presentIfNotNull(hexColorValue),
                        name = labelName
                    )
                )

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
