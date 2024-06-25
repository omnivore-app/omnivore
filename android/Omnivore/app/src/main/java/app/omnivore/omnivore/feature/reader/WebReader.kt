package app.omnivore.omnivore.feature.reader

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.graphics.Rect
import android.graphics.drawable.ShapeDrawable
import android.graphics.drawable.shapes.RoundRectShape
import android.os.Build
import android.util.Log
import android.view.*
import android.view.View.OnScrollChangeListener
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.omnivore.omnivore.R
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.*

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebReader(
    styledContent: String,
    webReaderViewModel: WebReaderViewModel,
    currentTheme: Themes?,
    modifier: Modifier = Modifier
) {
    val javascriptActionLoopUUID: UUID by webReaderViewModel.javascriptActionLoopUUIDFlow.collectAsStateWithLifecycle(
            UUID.randomUUID()
        )
    val isDarkMode = isSystemInDarkTheme()

    val volumeForScrollState by webReaderViewModel.volumeRockerForScrollState.collectAsStateWithLifecycle()

    Box(modifier) {
        AndroidView(factory = {
            OmnivoreWebView(it).apply {
                viewModel = webReaderViewModel

                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT
                )

                settings.javaScriptEnabled = true
                settings.allowContentAccess = true
                settings.allowFileAccess = true
                settings.domStorageEnabled = true

                alpha = 1.0f
                viewModel?.showNavBar()
                currentTheme?.let { theme ->
                    val bg = when (theme) {
                        Themes.SYSTEM -> {
                            if (isDarkMode) {
                                Color.BLACK
                            } else {
                                Color.WHITE
                            }
                        }

                        else -> {
                            theme.backgroundColor
                        }
                    }
                    setBackgroundColor(bg.toInt())

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        val scrollbarColor = when (theme) {
                            Themes.SYSTEM -> {
                                if (isDarkMode) {
                                    Color.WHITE
                                } else {
                                    Color.BLACK
                                }
                            }

                            else -> {
                                theme.scrollbarColor
                            }
                        }

                        val rad = 8f
                        val shape = ShapeDrawable(
                            RoundRectShape(
                                floatArrayOf(
                                    rad, rad, rad, rad, rad, rad, rad, rad
                                ), null, null
                            )
                        )
                        shape.paint.color = scrollbarColor.toInt()
                        verticalScrollbarThumbDrawable = shape
                    }
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        view: WebView?, request: WebResourceRequest?
                    ): Boolean {
                        var handled: Boolean? = null
                        request?.let {
                            if (request.isForMainFrame && request.hasGesture() && viewModel != null) {
                                viewModel?.showOpenLinkSheet(context, request.url)
                                handled = true
                            }
                        }

                        return handled ?: super.shouldOverrideUrlLoading(view, request)
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
                            CoroutineScope(Dispatchers.Main).launch {
                                webReaderViewModel.hasTappedExistingHighlight = true
                                webReaderViewModel.lastTapCoordinates = tapCoordinates
                                startActionMode(null, ActionMode.TYPE_FLOATING)
                            }
                        }

                        "writeToClipboard" -> {
                            val quote = Gson().fromJson(json, HighlightQuote::class.java).quote
                            quote.let { unwrappedQuote ->
                                val clipboard =
                                    context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
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
                Log.d("HTMLContent", styledContent)
                requestFocus()
                setOnKeyListener { _, keyCode, event ->
                    if (event.action == KeyEvent.ACTION_DOWN) {
                        when (keyCode) {
                            KeyEvent.KEYCODE_VOLUME_UP -> {
                                if (!volumeForScrollState) {
                                    return@setOnKeyListener false
                                }
                                scrollVertically(OmnivoreWebView.Direction.UP)
                                return@setOnKeyListener true
                            }

                            KeyEvent.KEYCODE_VOLUME_DOWN -> {
                                if (!volumeForScrollState) {
                                    return@setOnKeyListener false
                                }
                                scrollVertically(OmnivoreWebView.Direction.DOWN)
                                return@setOnKeyListener true
                            }
                        }
                    }
                    // default value
                    false
                }
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

class OmnivoreWebView(context: Context) : WebView(context), OnScrollChangeListener {
    var viewModel: WebReaderViewModel? = null
    var actionMode: ActionMode? = null
    val density = resources.displayMetrics.density

    init {
        setOnScrollChangeListener(this)
    }

    enum class Direction(val value: Int) {
        UP(-1), DOWN(1)
    }

    fun scrollVertically(direction: Direction, heightFactor: Int = 10) {
        if (canScrollVertically(direction.value)) {
            val scrollByValue = height.div(heightFactor)
            scrollBy(0, direction.value.times(scrollByValue))
        }
    }

    private val actionModeCallback = object : ActionMode.Callback2() {
        // Called when the action mode is created; startActionMode() was called
        override fun onCreateActionMode(mode: ActionMode, menu: Menu): Boolean {
            actionMode = mode
            if (viewModel?.hasTappedExistingHighlight == true) {
                Log.d("wv", "inflating existing highlight menu")
                mode.menuInflater.inflate(R.menu.highlight_selection_menu, menu)
            } else {
                viewModel?.showHighlightColorPalette()
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
                    val script =
                        "var event = new Event('copyHighlight');document.dispatchEvent(event);"
                    evaluateJavascript(script) {
                        clearFocus()
                        mode.finish()
                        actionMode = null
                    }
                    true
                }

                R.id.copyTextSelection -> {
                    val script =
                        "var event = new Event('copyTextSelection');document.dispatchEvent(event);"
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
            viewModel?.hideHighlightColorPalette()
            actionMode = null
        }

        override fun onGetContentRect(mode: ActionMode?, view: View?, outRect: Rect?) {
            Log.d("wv", "outRect: $outRect, View: $view")
            if (viewModel?.lastTapCoordinates != null) {
                val xValue = (viewModel!!.lastTapCoordinates!!.tapX * density).toInt()
                val yValue = (viewModel!!.lastTapCoordinates!!.tapY * density).toInt()
                val rect = Rect(xValue, yValue, xValue, yValue)

                Log.d(
                    "wvt",
                    "setting rect based on last tapped rect: ${viewModel?.lastTapCoordinates.toString()}"
                )
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
        originalView: View?, callback: ActionMode.Callback?
    ): ActionMode {
        Log.d("wv", "startActionMode:originalView:callback called")
        return super.startActionModeForChild(originalView, actionModeCallback)
    }

    override fun startActionMode(callback: ActionMode.Callback?, type: Int): ActionMode {
        Log.d("wv", "startActionMode:type called")
        return super.startActionMode(actionModeCallback, type)
    }

    override fun onScrollChange(view: View?, x: Int, y: Int, oldX: Int, oldY: Int) {
        viewModel?.onScrollChange((oldY - y).toFloat())
    }
}

class AndroidWebKitMessenger(val messageHandler: (String, String) -> Unit) {
    @JavascriptInterface
    fun handleIdentifiableMessage(actionID: String, jsonString: String) {
        messageHandler(actionID, jsonString)
    }
}

data class TapCoordinates(
    val tapX: Double, val tapY: Double
)

data class HighlightQuote(val quote: String?)
