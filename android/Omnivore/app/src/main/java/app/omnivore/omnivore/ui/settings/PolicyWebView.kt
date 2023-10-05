package app.omnivore.omnivore.ui.settings

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.R

@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter", "SetJavaScriptEnabled")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PolicyWebView(navController: NavHostController, url: String) {
  Scaffold(
    topBar = {
      TopAppBar(
        title = { androidx.compose.material3.Text(stringResource(R.string.policy_webview_title)) },
        actions = {
          IconButton(onClick = { navController.navigate(Routes.Settings.route) }) {
            Icon(
              imageVector = Icons.Default.Settings,
              contentDescription = null
            )
          }
        }, colors = TopAppBarDefaults.topAppBarColors(
          containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
      )
    }
  ) {
    val isDarkMode = isSystemInDarkTheme()

    Box {
      AndroidView(factory = {
        WebView(it).apply {
          if (isDarkMode) {
            setBackgroundColor(Color.Transparent.hashCode())
          }

          layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          )

          settings.javaScriptEnabled = true
          settings.allowContentAccess = true
          settings.allowFileAccess = true
          settings.domStorageEnabled = true

          alpha = 0.0f

          webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
              super.onPageFinished(view, url)
              view?.animate()?.alpha(1.0f)?.duration = 200
            }
          }

//          val themeID = if (isDarkMode) "Gray" else "LightGray"
//          loadUrl(url, mutableMapOf("Set-Cookie" to "theme=$themeID; Max-Age=31536000;"))
          loadUrl(url, mutableMapOf())
        }
      }, update = {}
      )
    }
  }
}
