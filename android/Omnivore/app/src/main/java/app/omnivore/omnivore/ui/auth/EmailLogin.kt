package app.omnivore.omnivore.ui.auth

import android.annotation.SuppressLint
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
import app.omnivore.omnivore.BuildConfig
import app.omnivore.omnivore.R

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun EmailLoginView(viewModel: LoginViewModel) {
  val uriHandler = LocalUriHandler.current
  var email by rememberSaveable { mutableStateOf("") }
  var password by rememberSaveable { mutableStateOf("") }

  Row(
    horizontalArrangement = Arrangement.Center
  ) {
    Spacer(modifier = Modifier.weight(1.0F))
    Column(
      verticalArrangement = Arrangement.Center,
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      LoginFields(
        email,
        password,
        onEmailChange = { email = it },
        onPasswordChange = { password = it },
        onLoginClick = { viewModel.login(email, password) }
      )

      // TODO: add a activity indicator (maybe after a delay?)
      if (viewModel.isLoading) {
        Text(stringResource(R.string.email_login_loading))
      }

      Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        ClickableText(
          text = AnnotatedString(stringResource(R.string.email_login_action_back)),
          style = MaterialTheme.typography.titleMedium
            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
          onClick = { viewModel.showSocialLogin() }
        )

        ClickableText(
          text = AnnotatedString(stringResource(R.string.email_login_action_no_account)),
          style = MaterialTheme.typography.titleMedium
            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
          onClick = { viewModel.showEmailSignUp() }
        )

        ClickableText(
          text = AnnotatedString(stringResource(R.string.email_login_action_forgot_password)),
          style = MaterialTheme.typography.titleMedium
            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
          onClick = {
            val uri = "${BuildConfig.OMNIVORE_WEB_URL}/auth/forgot-password"
            uriHandler.openUri(uri)
          }
        )
      }
    }
    Spacer(modifier = Modifier.weight(1.0F))
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginFields(
  email: String,
  password: String,
  onEmailChange: (String) -> Unit,
  onPasswordChange: (String) -> Unit,
  onLoginClick: () -> Unit
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
      value = email,
      placeholder = { Text(stringResource(R.string.email_login_field_placeholder_email)) },
      label = { Text(stringResource(R.string.email_login_field_label_email)) },
      onValueChange = onEmailChange,
      keyboardOptions = KeyboardOptions(
        imeAction = ImeAction.Done,
        keyboardType = KeyboardType.Email,
        ),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    OutlinedTextField(
      value = password,
      placeholder = { Text(stringResource(R.string.email_login_field_placeholder_password)) },
      label = { Text(stringResource(R.string.email_login_field_label_password)) },
      onValueChange = onPasswordChange,
      visualTransformation = PasswordVisualTransformation(),
      keyboardOptions = KeyboardOptions(
        imeAction = ImeAction.Done,
        keyboardType = KeyboardType.Password,
      ),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    Button(onClick = {
      if (email.isNotBlank() && password.isNotBlank()) {
        onLoginClick()
        focusManager.clearFocus()
      } else {
        Toast.makeText(
          context,
          context.getString(R.string.email_login_error_msg),
          Toast.LENGTH_SHORT
        ).show()
      }
    }, colors = ButtonDefaults.buttonColors(
         contentColor = Color(0xFF3D3D3D),
         containerColor = Color(0xffffd234)
       )
    ) {
      Text(
        text = stringResource(R.string.email_login_action_login),
        modifier = Modifier.padding(horizontal = 100.dp)
      )
    }
  }
}
