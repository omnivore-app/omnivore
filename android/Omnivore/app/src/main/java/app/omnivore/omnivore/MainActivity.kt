package app.omnivore.omnivore

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import androidx.compose.runtime.livedata.observeAsState
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val viewModel: LoginViewModel by viewModels()

    setContent {
      OmnivoreTheme {
        // A surface container using the 'background' color from the theme
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
          PrimaryView(viewModel)
        }
      }
    }

    // animate the view up when keyboard appears
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val rootView = findViewById<View>(android.R.id.content).rootView
    ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
      val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
      rootView.setPadding(0, 0, 0, imeHeight)
      insets
    }
  }
}

@Composable
fun PrimaryView(viewModel: LoginViewModel) {
  val hasAuthToken: Boolean by viewModel.hasAuthTokenLiveData.observeAsState(false)

  if (hasAuthToken) {
    LoggedInView(viewModel)
  } else {
    LoginView(viewModel)
  }
}

@Composable
fun LoggedInView(viewModel: LoginViewModel) {
  Column(
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier
      .background(MaterialTheme.colors.background)
      .fillMaxSize()
  ) {
    Text("You have a valid auth token. Nice. Go save something in Chrome!")

    Button(onClick = {
      viewModel.logout()
    }) {
      Text(text = "Logout")
    }
  }
}

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun LoginView(viewModel: LoginViewModel) {
  var email by rememberSaveable { mutableStateOf("") }
  var password by rememberSaveable { mutableStateOf("") }
  val focusManager = LocalFocusManager.current
  val snackBarHostState = remember { SnackbarHostState() }
  val coroutineScope = rememberCoroutineScope()

  Column(
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier
      .background(MaterialTheme.colors.background)
      .fillMaxSize()
      .clickable { focusManager.clearFocus() }
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
      Text("Loading...")
    }

    if (viewModel.errorMessage != null) {
      coroutineScope.launch {
        val result = snackBarHostState
          .showSnackbar(
            viewModel.errorMessage!!,
            actionLabel = "Dismiss",
            duration = SnackbarDuration.Indefinite
          )
        when (result) {
          SnackbarResult.ActionPerformed -> viewModel.resetErrorMessage()
        }
      }

      SnackbarHost(hostState = snackBarHostState)
    }
  }
}

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
      if (email.isNotBlank() && password.isNotBlank()) {
        onLoginClick()
        focusManager.clearFocus()
      } else {
        Toast.makeText(
          context,
          "Please enter an email address and password.",
          Toast.LENGTH_SHORT
        ).show()
      }
    }) {
      Text(text = "Login")
    }
  }
}

//@Preview(
//  uiMode = Configuration.UI_MODE_NIGHT_YES,
//  showBackground = true,
//  name = "Dark Mode"
//)
//@Preview(showBackground = true)
//@Composable
//fun DefaultPreview() {
//  OmnivoreTheme {
//    LoginView()
//  }
//}
