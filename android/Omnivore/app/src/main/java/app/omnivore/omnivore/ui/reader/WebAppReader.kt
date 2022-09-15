package app.omnivore.omnivore.ui.reader

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import app.omnivore.omnivore.BuildConfig

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun ArticleWebView(slug: String, authCookieString: String) {
  WebView.setWebContentsDebuggingEnabled(true)

  val url = BuildConfig.OMNIVORE_WEB_URL + "/app/me/$slug"

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
      CookieManager.getInstance().setCookie(BuildConfig.OMNIVORE_API_URL, authCookieString)
      CookieManager.getInstance().setCookie(BuildConfig.OMNIVORE_WEB_URL, authCookieString) {
        loadUrl(url)
      }
    }
  }, update = {
    it.loadUrl(url)
  })
}
