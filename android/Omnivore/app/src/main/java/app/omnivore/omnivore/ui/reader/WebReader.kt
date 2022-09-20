package app.omnivore.omnivore.ui.reader

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.viewinterop.AndroidView

@Composable
fun WebReaderLoadingContainer(slug: String, webReaderViewModel: WebReaderViewModel) {
  val webReaderParams: WebReaderParams? by webReaderViewModel.webReaderParamsLiveData.observeAsState(null)

  if (webReaderParams == null) {
    webReaderViewModel.loadItem()
  }

  if (webReaderParams != null) {
    WebReader(webReaderParams!!)
  } else {
    // TODO: add a proper loading view
    Text("Loading...")
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebReader(params: WebReaderParams) {
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
    WebView(it).apply {
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

      loadDataWithBaseURL("file:///android_asset/", styledContent, "text/html; charset=utf-8", "utf-8", null);

    }
  }, update = {
    it.loadDataWithBaseURL("file:///android_asset/", styledContent, "text/html; charset=utf-8", "utf-8", null);
  })
}
