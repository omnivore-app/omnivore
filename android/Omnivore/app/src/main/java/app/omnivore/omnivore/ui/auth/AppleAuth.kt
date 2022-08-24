package app.omnivore.omnivore.ui.auth

import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Done
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import app.omnivore.omnivore.R

@Composable
fun AppleAuthButton(viewModel: LoginViewModel) {
  var showDialog =  remember { mutableStateOf(false) }

  LoadingButtonWithIcon(
    text = "Continue with Apple",
    loadingText = "Signing in...",
    isLoading = viewModel.isLoading,
    icon = painterResource(id = R.drawable.ic_logo_apple),
    modifier = Modifier.padding(vertical = 6.dp),
    onClick = { showDialog.value = true }
  )

  if (showDialog.value) {
    AppleAuthDialog(setShowDialog = {
      showDialog.value = false
    })
  }
}

@Composable
fun AppleAuthDialog(setShowDialog: (Boolean) -> Unit) {
  Dialog(onDismissRequest = { setShowDialog(false) }) {
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = Color.White
    ) {
      AppleAuthWebView()
//      Box(
//        contentAlignment = Alignment.Center
//      ) {
//        Column(modifier = Modifier.padding(20.dp)) {
//          Row(
//            modifier = Modifier.fillMaxWidth(),
//            horizontalArrangement = Arrangement.SpaceBetween,
//            verticalAlignment = Alignment.CenterVertically
//          ) {
//            Icon(
//              imageVector = Icons.Filled.Done,
//              contentDescription = "",
//              tint = colorResource(android.R.color.darker_gray),
//              modifier = Modifier
//                .width(30.dp)
//                .height(30.dp)
//                .clickable { setShowDialog(false) }
//            )
//          }
//
//        }
//      }
    }
  }
}

@Composable
fun AppleAuthWebView() {
  // Declare a string that contains a url
  val mUrl = "https://omnivore.app"

  // Adding a WebView inside AndroidView
  // with layout as full screen
  AndroidView(factory = {
    WebView(it).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
      webViewClient = WebViewClient()
      loadUrl(mUrl)
    }
  }, update = {
    it.loadUrl(mUrl)
  })
}
