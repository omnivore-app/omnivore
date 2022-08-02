package app.omnivore.omnivore

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.tooling.preview.Preview
import app.omnivore.omnivore.ui.theme.OmnivoreTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      OmnivoreTheme {
        // A surface container using the 'background' color from the theme
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
          LoginView()
        }
      }
    }
  }
}

@Composable
fun LoginView() {
  var email by rememberSaveable { mutableStateOf("") }
  var password by rememberSaveable { mutableStateOf("") }

  Column(
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier
      .background(MaterialTheme.colors.background)
      .fillMaxSize()
  ) {
    OutlinedTextField(
      value = email,
      placeholder = { Text(text = "user@email.com") },
      label = { Text(text = "email") },
      onValueChange = onEmailChange,
    )

    OutlinedTextField(
      value = password,
      placeholder = { Text(text = "password") },
      label = { Text(text = "password") },
      onValueChange = onPasswordChange,
    )

    Button(onClick = {
      if (email.isBlank() == false && password.isBlank() == false) {
        onLoginClick(email)
        focusManager.clearFocus()
      } else {
        Toast.makeText(
          context,
          "Please enter email and password",
          Toast.LENGTH_SHORT
        ).show()
      }
    }) {
      Text("Login")
    }
  }
}

@Composable
fun LoginFields(
  email: String,
  password: String,
  onEmailChange: (String) -> Unit,
  onPasswordChange: (String) -> Unit,
  onLoginClick: (String) -> Unit
) {
  val focusManager = LocalFocusManager.current

  Column(
    modifier = Modifier
      .fillMaxWidth()
      .height(300.dp),
    verticalArrangement = Arrangement.spacedBy(25.dp),
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Text("Please login")

    OutlinedTextField(
      value = email,
      placeholder = { Text(text = "user@email.com") },
      label = { Text(text = "email") },
      onValueChange = onEmailChange,
      keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    OutlinedTextField(
      value = password,
      placeholder = { Text(text = "password") },
      label = { Text(text = "password") },
      onValueChange = onPasswordChange,
      visualTransformation = PasswordVisualTransformation(),
      keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
      keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
    )

    Button(onClick = {
      if (email.isBlank() == false && password.isBlank() == false) {
        onLoginClick(email)
        focusManager.clearFocus()
      } else {
        Toast.makeText(
          context,
          "Please enter an email and password",
          Toast.LENGTH_SHORT
        ).show()
      }
    }) {
      Text("Login")
    }
  }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
  OmnivoreTheme {
    LoginView()
  }
}
