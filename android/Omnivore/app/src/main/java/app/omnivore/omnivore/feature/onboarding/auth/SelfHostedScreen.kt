package app.omnivore.omnivore.feature.onboarding.auth

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.component.DividerWithText
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel
import app.omnivore.omnivore.utils.SELF_HOSTING_URL

@Composable
fun SelfHostedScreen(
    viewModel: OnboardingViewModel = hiltViewModel()
) {
    var apiServer by rememberSaveable { mutableStateOf("") }
    var webServer by rememberSaveable { mutableStateOf("") }
    val context = LocalContext.current

    Row(
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.padding(bottom = 64.dp)
    ) {
        Spacer(modifier = Modifier.weight(1.0F))
        Column(
            modifier = Modifier.fillMaxWidth(),
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
                },
                onResetClick = { viewModel.resetSelfHostingDetails(context) },
                isLoading = viewModel.isLoading
            )

            Column(
                modifier = Modifier.padding(top = 16.dp)
            ) {
                ClickableText(
                    text = AnnotatedString(stringResource(R.string.self_hosted_view_action_learn_more)),
                    style = MaterialTheme.typography.titleMedium
                        .plus(TextStyle(textDecoration = TextDecoration.Underline)),
                    onClick = {
                        val uri = Uri.parse(SELF_HOSTING_URL)
                        val browserIntent = Intent(Intent.ACTION_VIEW, uri)
                        ContextCompat.startActivity(context, browserIntent, null)
                    },
                    modifier = Modifier.padding(vertical = 10.dp)
                )
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
    onSaveClick: () -> Unit,
    onResetClick: () -> Unit,
    isLoading: Boolean
) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current

    Column(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
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
            modifier = Modifier.fillMaxWidth().padding(bottom = 32.dp),
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

        OutlinedButton(
            modifier = Modifier.fillMaxWidth(),
            onClick = {
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
                text = stringResource(R.string.self_hosted_view_action_save).uppercase(),
            )
            if (isLoading) {
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

        DividerWithText(text = "or")

        OutlinedButton(
            modifier = Modifier.fillMaxWidth(),
            onClick = { onResetClick() }
        ) {
            Text(
                text = "Reset".uppercase()
            )
        }
    }
}
