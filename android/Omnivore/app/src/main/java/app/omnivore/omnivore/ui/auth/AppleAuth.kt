package app.omnivore.omnivore.ui.auth

import android.annotation.SuppressLint
import android.net.Uri
import android.util.Log
import android.view.ViewGroup
import android.webkit.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.TopAppBar
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import app.omnivore.omnivore.AppleConstants
import app.omnivore.omnivore.R
import java.util.*

@Composable
fun AppleAuthButton(viewModel: LoginViewModel) {
  val showDialog =  remember { mutableStateOf(false) }

  LoadingButtonWithIcon(
    text = "Continue with Apple",
    loadingText = "Signing in...",
    isLoading = viewModel.isLoading,
    icon = painterResource(id = R.drawable.ic_logo_apple),
    modifier = Modifier.padding(vertical = 6.dp),
    onClick = { showDialog.value = true }
  )

  if (showDialog.value) {
    AppleAuthDialog(onDismiss = { authToken ->
      if (authToken != null ) {
        viewModel.saveAuthToken(authToken)
      }
      showDialog.value = false
    })
  }
}

@Composable
fun AppleAuthDialog(onDismiss: (String?) -> Unit) {
  Dialog(onDismissRequest = { onDismiss(null) }) {
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = Color.White
    ) {
      AppleAuthWebContainerView(onDismiss)
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun AppleAuthWebContainerView(onDismiss: (String?) -> Unit) {
  Scaffold(
    topBar = { TopAppBar(title = { Text("WebView", color = Color.White) }, backgroundColor = Color(0xff0f9d58)) },
    content = { AppleAuthWebView(onDismiss) }
  )
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AppleAuthWebView(onDismiss: (String?) -> Unit) {
  val url = AppleConstants.authUrl +
    "?client_id=" + AppleConstants.clientId +
    "&redirect_uri=" + AppleConstants.redirectURI +
    "&response_type=code%20id_token" +
    "&scope=" + AppleConstants.scope +
    "&response_mode=form_post" +
    "&state=android:login"

  // Adding a WebView inside AndroidView
  // with layout as full screen
  AndroidView(factory = {
    WebView(it).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
      webViewClient = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
          if (request?.url.toString().contains("client/auth")) {
            val uri = Uri.parse(request!!.url.toString())
            val token = uri.getQueryParameter("tok")
            onDismiss(token)
          }
          return true
        }
      }
      settings.javaScriptEnabled = true
      loadUrl(url)
    }
  }, update = {
    it.loadUrl(url)
  })
}
