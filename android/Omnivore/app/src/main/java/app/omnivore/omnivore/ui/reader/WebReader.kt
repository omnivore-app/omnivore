package app.omnivore.omnivore.ui.reader

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Rect
import android.util.Log
import android.view.*
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat.getSystemService
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.linkedItemViews.LinkedItemContextMenu
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.*
import kotlin.math.roundToInt


@Composable
fun WebReaderLoadingContainer(slug: String, webReaderViewModel: WebReaderViewModel) {
  var isMenuExpanded by remember { mutableStateOf(false) }
  var showWebPreferencesDialog by remember { mutableStateOf(false ) }

  val webReaderParams: WebReaderParams? by webReaderViewModel.webReaderParamsLiveData.observeAsState(null)
  val annotation: String? by webReaderViewModel.annotationLiveData.observeAsState(null)

  val maxToolbarHeight = 48.dp
  val maxToolbarHeightPx = with(LocalDensity.current) { maxToolbarHeight.roundToPx().toFloat() }
  val toolbarHeightPx = remember { mutableStateOf(maxToolbarHeightPx) }

  // Create a connection to the nested scroll system and listen to the scroll happening inside child Column
  val nestedScrollConnection = remember {
    object : NestedScrollConnection {
      override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
        val delta = available.y
        val newHeight = toolbarHeightPx.value + delta
        toolbarHeightPx.value = newHeight.coerceIn(0f, maxToolbarHeightPx)
        return Offset.Zero
      }
    }
  }

  if (webReaderParams == null) {
    webReaderViewModel.loadItem(slug = slug)
  }

  if (webReaderParams != null) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .nestedScroll(nestedScrollConnection)
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .verticalScroll(webReaderViewModel.scrollState)

      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .requiredHeight(height = maxToolbarHeight)
        ) {
        }
        WebReader(webReaderParams!!, webReaderViewModel.storedWebPreferences(isSystemInDarkTheme()), webReaderViewModel)
      }

      TopAppBar(
        modifier = Modifier
          .height(height = with(LocalDensity.current) {
            webReaderViewModel.currentToolbarHeight = toolbarHeightPx.value.toInt()
            toolbarHeightPx.value.roundToInt().toDp()
          } ),
        backgroundColor = MaterialTheme.colorScheme.surfaceVariant,
        title = {},
        actions = {
          // Disabling menu until we implement local persistence
//          IconButton(onClick = { isMenuExpanded = true }) {
//            Icon(
//              imageVector = Icons.Filled.Menu,
//              contentDescription = null
//            )
//          }
          IconButton(onClick = { showWebPreferencesDialog = true }) {
            Icon(
              imageVector = Icons.Filled.Settings, // TODO: set a better icon
              contentDescription = null
            )
          }
          LinkedItemContextMenu(
            isExpanded = isMenuExpanded,
            isArchived = webReaderParams!!.item.isArchived,
            onDismiss = { isMenuExpanded = false },
            actionHandler = { webReaderViewModel.handleLinkedItemAction(webReaderParams!!.item.id, it) }
          )
        }
      )

      if (showWebPreferencesDialog) {
        WebPreferencesDialog(
          onDismiss = {
            showWebPreferencesDialog = false
          },
          webReaderViewModel = webReaderViewModel
        )
      }

      if (annotation != null) {
        AnnotationEditView(
          initialAnnotation = annotation!!,
          onSave = {
            webReaderViewModel.saveAnnotation(it)
          },
          onCancel = {
            webReaderViewModel.cancelAnnotationEdit()
          }
        )
      }
    }
  } else {
    // TODO: add a proper loading view
    Text("Loading...")
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebReader(
  params: WebReaderParams,
  preferences: WebPreferences,
  webReaderViewModel: WebReaderViewModel
) {
  val javascriptActionLoopUUID: UUID by webReaderViewModel
    .javascriptActionLoopUUIDLiveData
    .observeAsState(UUID.randomUUID())

  WebView.setWebContentsDebuggingEnabled(true)

  val webReaderContent = WebReaderContent(
    preferences = preferences,
    item = params.item,
    articleContent = params.articleContent,
  )

  val styledContent = webReaderContent.styledContent()
  val isInDarkMode = isSystemInDarkTheme()

  Box {
    AndroidView(factory = {
      OmnivoreWebView(it).apply {
        if (isInDarkMode) {
          setBackgroundColor(Color.Transparent.hashCode())
        }
        viewModel = webReaderViewModel

        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )

        settings.javaScriptEnabled = true
        settings.allowContentAccess = true
        settings.allowFileAccess = true
        settings.domStorageEnabled = true

        webViewClient = object : WebViewClient() {
        }

        val javascriptInterface = AndroidWebKitMessenger { actionID, json ->
          webReaderViewModel.hasTappedExistingHighlight = false

          when (actionID) {
            "userTap" -> {
              val tapCoordinates = Gson().fromJson(json, TapCoordinates::class.java)
              Log.d("wvt", "received tap action: $tapCoordinates")
              CoroutineScope(Dispatchers.Main).launch {
                webReaderViewModel.lastTapCoordinates = tapCoordinates
                actionMode?.finish()
                actionMode = null
              }
            }
            "existingHighlightTap" -> {
              val tapCoordinates = Gson().fromJson(json, TapCoordinates::class.java)
              Log.d("wv", "receive existing highlight tap action: $tapCoordinates")
              CoroutineScope(Dispatchers.Main).launch {
                webReaderViewModel.hasTappedExistingHighlight = true
                webReaderViewModel.lastTapCoordinates = tapCoordinates
                startActionMode(null, ActionMode.TYPE_FLOATING)
              }
            }
            "writeToClipboard" -> {
              val quote = Gson().fromJson(json, HighlightQuote::class.java).quote
              quote.let { unwrappedQuote ->
                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                val clip = ClipData.newPlainText(unwrappedQuote, unwrappedQuote)
                clipboard.setPrimaryClip(clip)
              }
            }
            else -> {
              webReaderViewModel.handleIncomingWebMessage(actionID, json)
            }
          }
        }

        addJavascriptInterface(javascriptInterface, "AndroidWebKitMessenger")

        loadDataWithBaseURL(
          "file:///android_asset/",
          styledContent,
          "text/html; charset=utf-8",
          "utf-8",
          null
        )
      }
    }, update = {
      if (javascriptActionLoopUUID != webReaderViewModel.lastJavascriptActionLoopUUID) {
        for (script in webReaderViewModel.javascriptDispatchQueue) {
          Log.d("js", "executing script: $script")
          it.evaluateJavascript(script, null)
        }
        webReaderViewModel.resetJavascriptDispatchQueue()
      }
    })
  }
}

class OmnivoreWebView(context: Context) : WebView(context) {
  var viewModel: WebReaderViewModel? = null
  var actionMode: ActionMode? = null

  private val actionModeCallback = object : ActionMode.Callback2() {
    // Called when the action mode is created; startActionMode() was called
    override fun onCreateActionMode(mode: ActionMode, menu: Menu): Boolean {
      actionMode = mode
      if (viewModel?.hasTappedExistingHighlight == true) {
        Log.d("wv", "inflating existing highlight menu")
        mode.menuInflater.inflate(R.menu.highlight_selection_menu, menu)
      } else {
        mode.menuInflater.inflate(R.menu.text_selection_menu, menu)
      }
      return true
    }

    // Called each time the action mode is shown. Always called after onCreateActionMode, but
    // may be called multiple times if the mode is invalidated.
    override fun onPrepareActionMode(mode: ActionMode, menu: Menu): Boolean {
      return false // Return false if nothing is done
    }

    // Called when the user selects a contextual menu item
    override fun onActionItemClicked(mode: ActionMode, item: MenuItem): Boolean {
      return when (item.itemId) {
        R.id.annotateHighlight, R.id.annotate -> {
          val script = "var event = new Event('annotate');document.dispatchEvent(event);"
          evaluateJavascript(script) {
            mode.finish()
            actionMode = null
          }
          true
        }
        R.id.highlight -> {
          val script = "var event = new Event('highlight');document.dispatchEvent(event);"
          evaluateJavascript(script) {
            clearFocus()
            mode.finish()
            actionMode = null
          }
          true
        }
        R.id.copyHighlight -> {
          val script = "var event = new Event('copyHighlight');document.dispatchEvent(event);"
          evaluateJavascript(script) {
            clearFocus()
            mode.finish()
            actionMode = null
          }
          true
        }
        R.id.copyTextSelection -> {
          val script = "var event = new Event('copyTextSelection');document.dispatchEvent(event);"
          evaluateJavascript(script) {
            clearFocus()
            mode.finish()
            actionMode = null
          }
          true
        }
        R.id.removeHighlight -> {
          val script = "var event = new Event('remove');document.dispatchEvent(event);"
          evaluateJavascript(script) {
            clearFocus()
            mode.finish()
            actionMode = null
          }
          true
        }
        else -> {
          Log.d("Loggo", "${item.itemId} selected")
          false
        }
      }
    }

    // Called when the user exits the action mode
    override fun onDestroyActionMode(mode: ActionMode) {
      Log.d("wv", "destroying menu: $mode")
      viewModel?.hasTappedExistingHighlight = false
      actionMode = null
    }

    override fun onGetContentRect(mode: ActionMode?, view: View?, outRect: Rect?) {
      Log.d("wv", "outRect: $outRect, View: $view")
      if (viewModel?.lastTapCoordinates != null) {
        val scrollYOffset = viewModel?.scrollState?.value ?: 0
        val xValue = viewModel!!.lastTapCoordinates!!.tapX.toInt()
        val yValue = viewModel!!.lastTapCoordinates!!.tapY.toInt() + scrollYOffset + (viewModel?.currentToolbarHeight ?: 0)
        val rect = Rect(xValue, yValue, xValue, yValue)

        Log.d("wvt", "scrollState: ${viewModel?.scrollState?.value}, bar height: ${viewModel?.currentToolbarHeight}")
        Log.d("wvt", "setting rect based on last tapped rect: ${viewModel?.lastTapCoordinates.toString()}")
        Log.d("wvt", "rect: $rect")

        outRect?.set(rect)
      } else {
        outRect?.set(left, top, right, bottom)
      }
    }
  }

  override fun startActionMode(callback: ActionMode.Callback?): ActionMode {
    Log.d("wv", "startActionMode:callback called")
    return super.startActionMode(actionModeCallback)
  }

  override fun startActionModeForChild(
    originalView: View?,
    callback: ActionMode.Callback?
  ): ActionMode {
    Log.d("wv", "startActionMode:originalView:callback called")
    return super.startActionModeForChild(originalView, actionModeCallback)
  }

  override fun startActionMode(callback: ActionMode.Callback?, type: Int): ActionMode {
    Log.d("wv", "startActionMode:type called")
    return super.startActionMode(actionModeCallback, type)
  }
}

class AndroidWebKitMessenger(val messageHandler: (String, String) -> Unit) {
  @JavascriptInterface
  fun handleIdentifiableMessage(actionID: String, jsonString: String) {
    messageHandler(actionID, jsonString)
  }
}

data class TapCoordinates(
  val tapX: Double,
  val tapY: Double
)

data class HighlightQuote(val quote: String?)
