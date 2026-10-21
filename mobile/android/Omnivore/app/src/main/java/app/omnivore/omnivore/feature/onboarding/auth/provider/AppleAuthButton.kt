package app.omnivore.omnivore.feature.onboarding.auth.provider

import android.annotation.SuppressLint
import android.net.Uri
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel
import app.omnivore.omnivore.utils.AppleConstants
import java.net.URLEncoder

@Composable
fun AppleAuthButton(viewModel: OnboardingViewModel) {
    val showDialog = remember { mutableStateOf(false) }

    OutlinedButton(
        onClick = {
            showDialog.value = true
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 16.dp, end = 16.dp),
        shape = RoundedCornerShape(6.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.White,
            contentColor = MaterialTheme.colorScheme.onSurface
        )
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_logo_apple),
            contentDescription = "",
            modifier = Modifier.padding(end = 10.dp)
        )
        Text(text = stringResource(R.string.apple_auth_text), modifier = Modifier.padding(vertical = 6.dp))
        if (viewModel.isLoading) {
            Spacer(modifier = Modifier.width(16.dp))
            CircularProgressIndicator(
                modifier = Modifier
                    .height(16.dp)
                    .width(16.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }

    if (showDialog.value) {
        AppleAuthDialog(onDismiss = { token ->
            if (token != null) {
                viewModel.handleAppleToken(token)
            }
            showDialog.value = false
        })
    }
}

@Composable
fun AppleAuthDialog(onDismiss: (String?) -> Unit) {
    Dialog(onDismissRequest = { onDismiss(null) }) {
        Surface(
            shape = RoundedCornerShape(16.dp), color = Color.White
        ) {
            AppleAuthWebView(onDismiss)
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AppleAuthWebView(onDismiss: (String?) -> Unit) {
    val url =
        AppleConstants.authUrl + "?client_id=" + AppleConstants.clientId + "&redirect_uri=" + URLEncoder.encode(
            AppleConstants.redirectURI,
            "utf8"
        ) + "&response_type=code%20id_token" + "&scope=" + AppleConstants.scope + "&response_mode=form_post" + "&state=android:login"

    // Adding a WebView inside AndroidView
    // with layout as full screen
    AndroidView(factory = {
        WebView(it).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT
            )
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?, request: WebResourceRequest?
                ): Boolean {
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
