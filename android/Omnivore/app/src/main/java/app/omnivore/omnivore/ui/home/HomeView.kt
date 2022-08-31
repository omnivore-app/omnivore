package app.omnivore.omnivore.ui.home

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.util.Log
import android.view.ViewGroup
import android.webkit.*
import android.widget.Space
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
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
  val selectedItemSlug = remember { mutableStateOf<String?>(null) }
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
      Row(
        horizontalArrangement = Arrangement.End
      ) {
        Spacer(modifier = Modifier.weight(1.0F))
        LogoutButton { loginViewModel.logout() }
      }
    }

    items(linkedItems) { item ->
      LinkedItemCard(
        item = item,
        onClickHandler = { selectedItemSlug.value = item.slug }
      )
    }
  }

  if (selectedItemSlug.value != null) {
    ArticleWebViewDialog(selectedItemSlug.value!!) {
      selectedItemSlug.value = null
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


@Composable
fun ArticleWebViewDialog(slug: String, onDismiss: () -> Unit) {
  Dialog(onDismissRequest = { onDismiss() }) {
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = Color.White
    ) {
      ArticleWebView(slug)
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun ArticleWebView(slug: String) {
  WebView.setWebContentsDebuggingEnabled(true)

  val authCookieString = "auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwODFkZThlOC01ODU0LTExZWMtODY4ZS03ZjU0ZjhiMzY0NGEiLCJpYXQiOjE2NjE4OTA1NjB9.zDE6SOGgRKKV7QuZUIsxEzb_M7o2pyTwshI_Lc_C8Co; Expires=Wed, 30 Aug 2023 20:16:00 GMT; HttpOnly; secure;"
  // add to local storage
  val url = "https://demo.omnivore.app/app/me/$slug"
//  val url = "https://demo.omnivore.app/app/me/algae-bloom-in-san-francisco-bay-lake-merritt-is-killing-fish-th-182e81e01dc"

  // Adding a WebView inside AndroidView
  // with layout as full screen
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
