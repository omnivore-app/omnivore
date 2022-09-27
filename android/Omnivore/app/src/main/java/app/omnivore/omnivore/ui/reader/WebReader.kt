package app.omnivore.omnivore.ui.reader

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Rect
import android.util.Log
import android.view.*
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.viewinterop.AndroidView
import app.omnivore.omnivore.R
import org.json.JSONObject


@Composable
fun WebReaderLoadingContainer(slug: String, webReaderViewModel: WebReaderViewModel) {
  val webReaderParams: WebReaderParams? by webReaderViewModel.webReaderParamsLiveData.observeAsState(null)

  if (webReaderParams == null) {
    webReaderViewModel.loadItem(slug = slug)
  }

  if (webReaderParams != null) {
    WebReader(webReaderParams!!, webReaderViewModel)
  } else {
    // TODO: add a proper loading view
    Text("Loading...")
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebReader(params: WebReaderParams, webReaderViewModel: WebReaderViewModel) {
  WebView.setWebContentsDebuggingEnabled(true)

  val webReaderContent = WebReaderContent(
    textFontSize = 12,
    lineHeight =  150,
    maxWidthPercentage = 100,
    item = params.item,
    themeKey = "LightGray",
    fontFamily = WebFont.SYSTEM ,
    articleContent = params.articleContent,
    prefersHighContrastText = false,
  )

  val styledContent = webReaderContent.styledContent()

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
        webReaderViewModel.handleIncomingWebMessage(actionID, json)
      }

      addJavascriptInterface(javascriptInterface, "AndroidWebKitMessenger")
      loadDataWithBaseURL("file:///android_asset/", styledContent, "text/html; charset=utf-8", "utf-8", null);

    }
  }, update = {
    it.loadDataWithBaseURL("file:///android_asset/", styledContent, "text/html; charset=utf-8", "utf-8", null);
  })
}

class OmnivoreWebView(context: Context) : WebView(context) {
  private val actionModeCallback = object : ActionMode.Callback2() {
    // Called when the action mode is created; startActionMode() was called
    override fun onCreateActionMode(mode: ActionMode, menu: Menu): Boolean {
      mode.menuInflater.inflate(R.menu.text_selection_menu, menu)
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
          Log.d("Loggo", "Annotate action selected")
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
        else -> {
          Log.d("Loggo", "${item.itemId} selected")
          false
        }
      }
    }

    // Called when the user exits the action mode
    override fun onDestroyActionMode(mode: ActionMode) {
//      actionMode = null
    }

    override fun onGetContentRect(mode: ActionMode?, view: View?, outRect: Rect?) {
      outRect?.set(left, top, right, bottom)
    }
  }

  private var currentActionModeCallback: ActionMode.Callback? = actionModeCallback

  override fun startActionMode(callback: ActionMode.Callback?): ActionMode {
    return super.startActionMode(currentActionModeCallback)
  }

  override fun startActionModeForChild(
    originalView: View?,
    callback: ActionMode.Callback?
  ): ActionMode {
    return super.startActionModeForChild(originalView, currentActionModeCallback)
  }

  override fun startActionMode(callback: ActionMode.Callback?, type: Int): ActionMode {
    return super.startActionMode(currentActionModeCallback, type)
  }
}

class AndroidWebKitMessenger(val messageHandler: (String, JSONObject) -> Unit) {
  @JavascriptInterface
  fun handleIdentifiableMessage(actionID: String, jsonString: String) {
    messageHandler(actionID, JSONObject(jsonString))
  }
}
