package app.omnivore.omnivore.ui.reader

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun ArticleWebView(slug: String, authCookieString: String) {
  WebView.setWebContentsDebuggingEnabled(true)

  val url = "https://demo.omnivore.app/app/me/$slug"

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

      CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
      CookieManager.getInstance().setAcceptCookie(true)
      CookieManager.getInstance().setCookie("https://api-demo.omnivore.app", authCookieString) {
        loadUrl(url)
      }
    }
  }, update = {
    it.loadUrl(url)
  })
}
