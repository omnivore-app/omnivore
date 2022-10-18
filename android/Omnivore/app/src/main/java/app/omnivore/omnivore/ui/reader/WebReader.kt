package app.omnivore.omnivore.ui.reader

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Rect
import android.util.Log
import android.view.*
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import app.omnivore.omnivore.R
import com.google.gson.Gson
import java.util.*
import kotlin.math.roundToInt


@Composable
fun WebReaderLoadingContainer(slug: String, webReaderViewModel: WebReaderViewModel) {
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
        WebReader(webReaderParams!!, webReaderViewModel.storedWebPreferences(), webReaderViewModel)
      }

      TopAppBar(
        modifier = Modifier
          .height(height = with(LocalDensity.current) {
            toolbarHeightPx.value.roundToInt().toDp()
          } ),
        backgroundColor = MaterialTheme.colorScheme.surfaceVariant,
        title = {},
        actions = {
          IconButton(onClick = { showWebPreferencesDialog = true }) {
            Icon(
              imageVector = Icons.Filled.Settings,
              contentDescription = null
            )
          }
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
    themeKey = "LightGray",
    articleContent = params.articleContent,
  )

  val styledContent = webReaderContent.styledContent()

  Box {
    AndroidView(factory = {
      OmnivoreWebView(it).apply {
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
          when (actionID) {
            "existingHighlightTap" -> {
              isExistingHighlightSelected = true
              actionTapCoordinates = Gson().fromJson(json, ActionTapCoordinates::class.java)
              Log.d("Loggo", "receive existing highlight tap action: $actionTapCoordinates")
              startActionMode(null, ActionMode.TYPE_PRIMARY)
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
  var isExistingHighlightSelected = false
  var actionTapCoordinates: ActionTapCoordinates? = null

  private val actionModeCallback = object : ActionMode.Callback2() {
    // Called when the action mode is created; startActionMode() was called
    override fun onCreateActionMode(mode: ActionMode, menu: Menu): Boolean {
      if (isExistingHighlightSelected) {
        mode.menuInflater.inflate(R.menu.highlight_selection_menu, menu)
        isExistingHighlightSelected = false
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
        R.id.annotate -> {
          val script = "var event = new Event('annotate');document.dispatchEvent(event);"
          evaluateJavascript(script, null)
          mode.finish()
          true
        }
        R.id.highlight -> {
          val script = "var event = new Event('highlight');document.dispatchEvent(event);"
          evaluateJavascript(script, null)
          clearFocus()
          mode.finish()
          true
        }
        R.id.delete -> {
          val script = "var event = new Event('remove');document.dispatchEvent(event);"
          evaluateJavascript(script, null)
          clearFocus()
          mode.finish()
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
      Log.d("Loggo", "destroying menu: $mode")
      isExistingHighlightSelected = false
      actionTapCoordinates = null
    }

    override fun onGetContentRect(mode: ActionMode?, view: View?, outRect: Rect?) {
      Log.d("Loggo", "outRect: $outRect, View: $view")
      outRect?.set(left, top, right, bottom)
    }
  }

  override fun startActionMode(callback: ActionMode.Callback?): ActionMode {
    return super.startActionMode(actionModeCallback)
  }

  override fun startActionModeForChild(
    originalView: View?,
    callback: ActionMode.Callback?
  ): ActionMode {
    return super.startActionModeForChild(originalView, actionModeCallback)
  }

  override fun startActionMode(callback: ActionMode.Callback?, type: Int): ActionMode {
    Log.d("Loggo", "startActionMode:type called")
    return super.startActionMode(actionModeCallback, type)
  }
}

class AndroidWebKitMessenger(val messageHandler: (String, String) -> Unit) {
  @JavascriptInterface
  fun handleIdentifiableMessage(actionID: String, jsonString: String) {
    messageHandler(actionID, jsonString)
  }
}

data class ActionTapCoordinates(
  val rectX: Double,
  val rectY: Double,
  val rectWidth: Double,
  val rectHeight: Double,
)
