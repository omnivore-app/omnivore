package app.omnivore.omnivore.ui.home

import android.annotation.SuppressLint
import android.net.Uri
import android.util.Log
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import app.omnivore.omnivore.AppleConstants
import app.omnivore.omnivore.ui.auth.AppleAuthDialog
import app.omnivore.omnivore.ui.auth.LoginViewModel
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions

@Composable
fun HomeView(loginViewModel: LoginViewModel, homeViewModel: HomeViewModel) {
  val linkedItems: List<LinkedItem> by homeViewModel.itemsLiveData.observeAsState(listOf())

  // Fetch items
  homeViewModel.load()

  LazyColumn(
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier
      .background(MaterialTheme.colorScheme.background)
      .fillMaxSize()
      .padding(horizontal = 6.dp)
  ) {
    item {
      Text("You have a valid auth token. Nice. Go save something in Chrome!")
    }

    item {
      LogoutButton { loginViewModel.logout() }
    }

    items(linkedItems) { item ->
      Text(item.title, modifier = Modifier.clickable {
        Log.d("log", "clicked title: ${item.title}")
      })
      Spacer(modifier = Modifier.height(16.dp))
    }
  }
}

@Composable
fun LogoutButton(actionHandler: () -> Unit) {
  val context = LocalContext.current

  Button(onClick = {
    // Sign out google users
    val signInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
      .build()

    val googleSignIn = GoogleSignIn.getClient(context, signInOptions)
    googleSignIn.signOut()

    actionHandler()
  }) {
    Text(text = "Logout")
  }
}


if (showDialog.value) {
  AppleAuthDialog(onDismiss = { token ->
    if (token != null ) {
      viewModel.handleAppleToken(token)
    }
    showDialog.value = false
  })
}

@Composable
fun ArticleWebViewDialog(onDismiss: (String?) -> Unit) {
  Dialog(onDismissRequest = { onDismiss(null) }) {
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = Color.White
    ) {
      AppleAuthWebView(onDismiss)
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun ArticleWebView(onDismiss: (String?) -> Unit) {
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
          if (request?.url.toString().contains("android-apple-token")) {
            val uri = Uri.parse(request!!.url.toString())
            val token = uri.getQueryParameter("token")

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
