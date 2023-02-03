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
import androidx.activity.compose.LocalOnBackPressedDispatcherOwner
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.ModalBottomSheetValue
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
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.save.SaveSheetActivityBase
import app.omnivore.omnivore.ui.savedItemViews.SavedItemContextMenu
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.*
import kotlin.math.roundToInt

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
  var initialScrollYValue: Int? = null

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
          override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            val script = "var event = new Event('androidWebViewLoaded');document.dispatchEvent(event);console.log('scroll', 'onPageFinished')"
            evaluateJavascript(script, null)

            Log.d("scroll", "initial y value scroll: $initialScrollYValue")
            initialScrollYValue?.let { yValue ->
              view?.scrollTo(0, yValue)
            }
          }
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
            "autoScrollTo" -> {
              val scrollY = Gson().fromJson(json, ScrollToYValue::class.java).scrollY
              Log.d("scroll", "scrollY value: $scrollY")
              initialScrollYValue = scrollY?.toInt()
//              scrollY?.let { unwrappedYValue ->
//                scrollTo(0, unwrappedYValue.toInt())
//              }
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

data class ScrollToYValue(val scrollY: Double?)
