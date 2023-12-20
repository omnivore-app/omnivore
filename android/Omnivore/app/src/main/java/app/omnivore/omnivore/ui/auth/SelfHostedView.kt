package app.omnivore.omnivore.ui.auth

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import app.omnivore.omnivore.BuildConfig
import app.omnivore.omnivore.DatastoreKeys
import app.omnivore.omnivore.R

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun SelfHostedView(viewModel: LoginViewModel) {
    var apiServer by rememberSaveable { mutableStateOf("") }
    var webServer by rememberSaveable { mutableStateOf("") }
    val context = LocalContext.current

    Row(
        horizontalArrangement = Arrangement.Center
    ) {
        Spacer(modifier = Modifier.weight(1.0F))
        Column(
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            SelfHostedFields(
                apiServer,
                webServer,
                onAPIServerChange = { apiServer = it },
                onWebServerChange = { webServer = it },
                onSaveClick = {
                    viewModel.setSelfHostingDetails(context, apiServer, webServer)
                }
            )

            // TODO: add a activity indicator (maybe after a delay?)
            if (viewModel.isLoading) {
                Text(stringResource(R.string.self_hosted_view_loading))
            }

            Row(
                horizontalArrangement = Arrangement.Center,
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ClickableText(
                        text = AnnotatedString(stringResource(R.string.self_hosted_view_action_reset)),
                        style = MaterialTheme.typography.titleMedium
                            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
                        onClick = { viewModel.resetSelfHostingDetails(context) },
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    )
                    ClickableText(
                        text = AnnotatedString(stringResource(R.string.self_hosted_view_action_back)),
                        style = MaterialTheme.typography.titleMedium
                            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
                        onClick = { viewModel.showSocialLogin() },
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                    )
                    Spacer(modifier = Modifier.weight(1.0F))
//                Text("Omnivore is a free and open-source software project and allows self hosting. \n\n" +
//                        "If you have chosen to deploy your own server instance, fill in the above fields to " +
//                        "your private self-hosted instance.\n\n"
//                )
                    ClickableText(
                        text = AnnotatedString(stringResource(R.string.self_hosted_view_action_learn_more)),
                        style = MaterialTheme.typography.titleMedium
                            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
                        onClick = {
                            val uri = Uri.parse("https://docs.omnivore.app/self-hosting/self-hosting.html")
                            val browserIntent = Intent(Intent.ACTION_VIEW, uri)
                            ContextCompat.startActivity(context, browserIntent, null)
                        },
                        modifier = Modifier.padding(vertical = 10.dp)
                    )
                }
            }
        }
        Spacer(modifier = Modifier.weight(1.0F))
    }
}

@Composable
fun SelfHostedFields(
    apiServer: String,
    webServer: String,
    onAPIServerChange: (String) -> Unit,
    onWebServerChange: (String) -> Unit,
    onSaveClick: () -> Unit
) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(300.dp),
        verticalArrangement = Arrangement.spacedBy(25.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        OutlinedTextField(
            value = apiServer,
            placeholder = { Text(text = "https://api-prod.omnivore.app/") },
            label = { Text(stringResource(R.string.self_hosted_view_field_api_url_label)) },
            onValueChange = onAPIServerChange,
            keyboardOptions = KeyboardOptions(
                imeAction = ImeAction.Done,
                keyboardType = KeyboardType.Uri,
            ),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        OutlinedTextField(
            value = webServer,
            placeholder = { Text(text = "https://omnivore.app/") },
            label = { Text(stringResource(R.string.self_hosted_view_field_web_url_label)) },
            onValueChange = onWebServerChange,
            keyboardOptions = KeyboardOptions(
                imeAction = ImeAction.Done,
                keyboardType = KeyboardType.Uri,
            ),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        Button(onClick = {
            if (apiServer.isNotBlank() && webServer.isNotBlank()) {
                onSaveClick()
                focusManager.clearFocus()
            } else {
                Toast.makeText(
                    context,
                    context.getString(R.string.self_hosted_view_error_msg),
                    Toast.LENGTH_SHORT
                ).show()
            }
        }, colors = ButtonDefaults.buttonColors(
            contentColor = Color(0xFF3D3D3D),
            containerColor = Color(0xffffd234)
        )
        ) {
            Text(
                text = stringResource(R.string.self_hosted_view_action_save),
                modifier = Modifier.padding(horizontal = 100.dp)
            )
        }
    }
}
