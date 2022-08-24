package app.omnivore.omnivore.ui.auth

import android.annotation.SuppressLint
import android.util.Log
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
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
    AppleAuthDialog(onDismiss = {
      showDialog.value = false
      Log.i("Apple payload: ", it ?: "null")
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
    "?client_id=" +
    AppleConstants.clientId +
    "&redirect_uri=" +
    AppleConstants.redirectURI +
    "&response_type=code%20id_token&scope=" +
    AppleConstants.scope +
    "&response_mode=form_post&state=android:login"

//  clientId="app.omnivore"
//  scope="name email"
//  state="web:login"
//  redirectURI={appleAuthRedirectURI}
//  responseMode="form_post"
//  responseType="code id_token"
//  designProp={{
//    color: 'black',

  // Adding a WebView inside AndroidView
  // with layout as full screen
  AndroidView(factory = {
    WebView(it).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
//      webViewClient = WebViewClient()
      webViewClient = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
          Log.i("Apple payload one: ", request?.url.toString() ?: "null")
          if (request?.url.toString().startsWith(AppleConstants.redirectURI)) {
//            handleUrl(request?.url.toString())
            onDismiss(request?.url.toString())
            // Close the dialog after getting the authorization code
            if (request?.url.toString().contains("success=")) {
              onDismiss(null)
            }
            return true
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

//// A client to know about WebView navigation
//// For API 21 and above
//class AppleWebViewClient : WebViewClient() {
//  @TargetApi(Build.VERSION_CODES.LOLLIPOP)
//  override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
//    if (request?.url.toString().startsWith(AppleConstants.redirectURI)) {
//      handleUrl(request?.url.toString())
//      // Close the dialog after getting the authorization code
//      if (request.url.toString().contains("success=")) {
////        appledialog.dismiss()
//      }
//      return true
//    }
//    return true
//  }

//  // For API 19 and below
//  override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
//    if (url.startsWith(AppleConstants.redirectURI)) {
//      handleUrl(url)
//      // Close the dialog after getting the authorization code
//      if (url.contains("success=")) {
////        appledialog.dismiss()
//      }
//      return true
//    }
//    return false
//  }

//  @SuppressLint("ClickableViewAccessibility")
//  override fun onPageFinished(view: WebView?, url: String?) {
//    super.onPageFinished(view, url)
//    // retrieve display dimensions
//    val displayRectangle = Rect()
//    val window = this@AppleWebViewClient.w
//    window.decorView.getWindowVisibleDisplayFrame(displayRectangle)
//    // Set height of the Dialog to 90% of the screen
//    val layoutParams = view?.layoutParams
//    layoutParams?.height = (displayRectangle.height() * 0.9f).toInt()
//    view?.layoutParams = layoutParams
//  }

//  // Check WebView url for access token code or error
//  @SuppressLint("LongLogTag")
//  private fun handleUrl(url: String) {
//    val uri = Uri.parse(url)
//    val success = uri.getQueryParameter("success")
//    if (success == "true") {
//      // Get the Authorization Code from the URL
////      appleAuthCode = uri.getQueryParameter("code") ?: ""
////      Log.i("Apple Code: ", appleAuthCode)
//      // Get the Client Secret from the URL
////      appleClientSecret = uri.getQueryParameter("client_secret") ?: ""
////      Log.i("Apple Client Secret: ", appleClientSecret)
//      //Check if user gave access to the app for the first time by checking if the url contains their email
//      if (url.contains("email")) {
//        //Get user's First Name
//        val firstName = uri.getQueryParameter("first_name")
//        Log.i("Apple User First Name: ", firstName ?: "")
//        //Get user's Middle Name
//        val middleName = uri.getQueryParameter("middle_name")
//        Log.i("Apple User Middle Name: ", middleName ?: "")
//        //Get user's Last Name
//        val lastName = uri.getQueryParameter("last_name")
//        Log.i("Apple User Last Name: ", lastName ?: "")
//        //Get user's email
//        val email = uri.getQueryParameter("email")
//        Log.i("Apple User Email: ", email ?: "Not exists")
//      }
//      // Exchange the Auth Code for Access Token
////      requestForAccessToken(appleAuthCode, appleClientSecret)
//    } else if (success == "false") {
//      Log.e("ERROR", "We couldn't get the Auth Code")
//    }
//  }
//}
