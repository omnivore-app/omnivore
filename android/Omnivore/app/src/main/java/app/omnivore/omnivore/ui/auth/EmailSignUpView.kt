package app.omnivore.omnivore.ui.auth

import android.annotation.SuppressLint
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun EmailSignUpView(viewModel: LoginViewModel) {
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
        Text("Loading...")
      }

      ClickableText(
        text = AnnotatedString("Return to Social Login"),
        style = MaterialTheme.typography.titleMedium
          .plus(TextStyle(textDecoration = TextDecoration.Underline)),
        onClick = { viewModel.showSocialLogin() }
      )

      ClickableText(
        text = AnnotatedString("Already have an account?"),
        style = MaterialTheme.typography.titleMedium
          .plus(TextStyle(textDecoration = TextDecoration.Underline)),
        onClick = { viewModel.showEmailSignIn() }
      )
    }
    Spacer(modifier = Modifier.weight(1.0F))
  }
}

@OptIn(ExperimentalMaterial3Api::class)
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
      .height(300.dp),
    verticalArrangement = Arrangement.spacedBy(25.dp),
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    OutlinedTextField(
      value = email,
      placeholder = { Text(text = "user@email.com") },
      label = { Text(text = "Email") },
      onValueChange = onEmailChange,
      keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    OutlinedTextField(
      value = password,
      placeholder = { Text(text = "Password") },
      label = { Text(text = "Password") },
      onValueChange = onPasswordChange,
      visualTransformation = PasswordVisualTransformation(),
      keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    OutlinedTextField(
      value = name,
      placeholder = { Text(text = "Name") },
      label = { Text(text = "Name") },
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
        placeholder = { Text(text = "Username") },
        label = { Text(text = "Username") },
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
          text = usernameValidationErrorMessage!!,
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
          "Please complete all fields.",
          Toast.LENGTH_SHORT
        ).show()
      }
    }, colors = ButtonDefaults.buttonColors(
      contentColor = Color(0xFF3D3D3D),
      containerColor = Color(0xffffd234)
    )
    ) {
      Text(
        text = "Sign Up",
        modifier = Modifier.padding(horizontal = 100.dp)
      )
    }
  }
}
