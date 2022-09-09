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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun CreateUserProfileView(viewModel: LoginViewModel) {
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
      Text(
        text = "Create Your Profile",
        style = MaterialTheme.typography.headlineMedium,
        modifier = Modifier.padding(bottom = 8.dp)
      )
      UserProfileFields(
        name = name,
        username = username,
        usernameValidationErrorMessage = viewModel.usernameValidationErrorMessage,
        showUsernameAsAvailable = viewModel.hasValidUsername,
        onNameChange = { name = it },
        onUsernameChange = {
          username = it
          viewModel.validateUsername(it)
        },
        onSubmit = { viewModel.submitProfile(username = username, name = name) }
      )

      // TODO: add a activity indicator (maybe after a delay?)
      if (viewModel.isLoading) {
        Text("Loading...")
      }

      ClickableText(
        text = AnnotatedString("Cancel Sign Up"),
        style = MaterialTheme.typography.titleMedium
          .plus(TextStyle(textDecoration = TextDecoration.Underline)),
        onClick = { viewModel.cancelNewUserSignUp() }
      )
    }
    Spacer(modifier = Modifier.weight(1.0F))
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserProfileFields(
  name: String,
  username: String,
  usernameValidationErrorMessage: String?,
  showUsernameAsAvailable: Boolean, // TODO: use this to add green checkmark
  onNameChange: (String) -> Unit,
  onUsernameChange: (String) -> Unit,
  onSubmit: () -> Unit
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
        keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
      )

      if (usernameValidationErrorMessage != null) {
        Text(
          text = usernameValidationErrorMessage!!,
          style = MaterialTheme.typography.bodyLarge,
          color = MaterialTheme.colorScheme.error,
        )
      }
    }

    Button(
      onClick = {
        if (name.isNotBlank() && username.isNotBlank()) {
          onSubmit()
          focusManager.clearFocus()
        } else {
          Toast.makeText(
            context,
            "Please enter a valid username and password.",
            Toast.LENGTH_SHORT
          ).show()
        }
      }, colors = ButtonDefaults.buttonColors(
        contentColor = Color(0xFF3D3D3D),
        containerColor = Color(0xffffd234)
      )
    ) {
      Text(
        text = "Submit",
        modifier = Modifier.padding(horizontal = 100.dp)
      )
    }
  }
}
