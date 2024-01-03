package app.omnivore.omnivore.ui.auth

import android.annotation.SuppressLint
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R

@Composable
fun EmailSignUpView(viewModel: LoginViewModel) {
  if (viewModel.pendingEmailUserCreds != null) {
    val email = viewModel.pendingEmailUserCreds?.email ?: ""
    val password = viewModel.pendingEmailUserCreds?.password ?: ""

    Row(
      horizontalArrangement = Arrangement.Center
    ) {
      Spacer(modifier = Modifier.weight(1.0F))
      Column(
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Text(
          text = stringResource(R.string.email_signup_verification_message, email),
          style = MaterialTheme.typography.titleMedium
        )

        Button(onClick = {
          viewModel.login(email, password)
        }, colors = ButtonDefaults.buttonColors(
          contentColor = Color(0xFF3D3D3D),
          containerColor = Color(0xffffd234)
        )
        ) {
          Text(
            text = stringResource(R.string.email_signup_check_status),
            modifier = Modifier.padding(horizontal = 100.dp)
          )
        }

        ClickableText(
          text = AnnotatedString(stringResource(R.string.email_signup_action_use_different_email)),
          style = MaterialTheme.typography.titleMedium
            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
          onClick = { viewModel.showEmailSignUp() }
        )
      }
    }
  } else {
    EmailSignUpForm(viewModel = viewModel)
  }
}

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun EmailSignUpForm(viewModel: LoginViewModel) {
  var email by rememberSaveable { mutableStateOf("") }
  var password by rememberSaveable { mutableStateOf("") }
  var name by rememberSaveable { mutableStateOf("") }
  var username by rememberSaveable { mutableStateOf("") }

  Row(
    horizontalArrangement = Arrangement.Center
  ) {
    Spacer(modifier = Modifier.weight(1.0F))
    Column(
      verticalArrangement = Arrangement.Center,
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      EmailSignUpFields(
        email = email,
        password = password,
        name = name,
        username = username,
        usernameValidationErrorMessage = viewModel.usernameValidationErrorMessage,
        showUsernameAsAvailable = viewModel.hasValidUsername,
        onEmailChange = { email = it },
        onPasswordChange = { password = it },
        onNameChange = { name = it },
        onUsernameChange = {
          username = it
          viewModel.validateUsername(it)
        },
        onSubmit = {
          viewModel.submitEmailSignUp(
            email = email,
            password = password,
            username = username,
            name = name
          )
        }
      )

      // TODO: add a activity indicator (maybe after a delay?)
      if (viewModel.isLoading) {
        Text(stringResource(R.string.email_signup_loading))
      }

      Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        ClickableText(
          text = AnnotatedString(stringResource(R.string.email_signup_action_back)),
          style = MaterialTheme.typography.titleMedium
            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
          onClick = { viewModel.showSocialLogin() }
        )

        ClickableText(
          text = AnnotatedString(stringResource(R.string.email_signup_action_already_have_account)),
          style = MaterialTheme.typography.titleMedium
            .plus(TextStyle(textDecoration = TextDecoration.Underline)),
          onClick = { viewModel.showEmailSignIn() }
        )
      }
    }
    Spacer(modifier = Modifier.weight(1.0F))
  }
}

@Composable
fun EmailSignUpFields(
  email: String,
  password: String,
  name: String,
  username: String,
  usernameValidationErrorMessage: String?,
  showUsernameAsAvailable: Boolean,
  onEmailChange: (String) -> Unit,
  onPasswordChange: (String) -> Unit,
  onNameChange: (String) -> Unit,
  onUsernameChange: (String) -> Unit,
  onSubmit: () -> Unit,
) {
  val context = LocalContext.current
  val focusManager = LocalFocusManager.current

  Column(
    modifier = Modifier
      .fillMaxWidth()
      .verticalScroll(rememberScrollState()),
    verticalArrangement = Arrangement.spacedBy(25.dp),
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    OutlinedTextField(
      value = email,
      placeholder = { Text(stringResource(R.string.email_signup_field_placeholder_email)) },
      label = { Text(stringResource(R.string.email_signup_field_label_email)) },
      onValueChange = onEmailChange,
      keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    OutlinedTextField(
      value = password,
      placeholder = { Text(stringResource(R.string.email_signup_field_placeholder_password)) },
      label = { Text(stringResource(R.string.email_signup_field_label_password)) },
      onValueChange = onPasswordChange,
      visualTransformation = PasswordVisualTransformation(),
      keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    OutlinedTextField(
      value = name,
      placeholder = { Text(stringResource(R.string.email_signup_field_placeholder_name)) },
      label = { Text(stringResource(R.string.email_signup_field_label_name)) },
      onValueChange = onNameChange,
      keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    Column(
      verticalArrangement = Arrangement.spacedBy(5.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      OutlinedTextField(
        value = username,
        placeholder = { Text(stringResource(R.string.email_signup_field_placeholder_username)) },
        label = { Text(stringResource(R.string.email_signup_field_label_username)) },
        onValueChange = onUsernameChange,
        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
        keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
        trailingIcon = {
          if (showUsernameAsAvailable) {
            Icon(
              imageVector = Icons.Filled.CheckCircle,
              contentDescription = null
            )
          }
        }
      )

      if (usernameValidationErrorMessage != null) {
        Text(
          text = usernameValidationErrorMessage,
          style = MaterialTheme.typography.bodyLarge,
          color = MaterialTheme.colorScheme.error,
          textAlign = TextAlign.Center
        )
      }
    }

    Button(onClick = {
      if (email.isNotBlank() && password.isNotBlank() && username.isNotBlank() && name.isNotBlank()) {
        onSubmit()
        focusManager.clearFocus()
      } else {
        Toast.makeText(
          context,
          context.getString(R.string.email_signup_error_msg),
          Toast.LENGTH_SHORT
        ).show()
      }
    }, colors = ButtonDefaults.buttonColors(
      contentColor = Color(0xFF3D3D3D),
      containerColor = Color(0xffffd234)
    )
    ) {
      Text(
        text = stringResource(R.string.email_signup_action_sign_up),
        modifier = Modifier.padding(horizontal = 100.dp)
      )
    }
  }
}
