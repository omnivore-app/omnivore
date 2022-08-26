package app.omnivore.omnivore.ui.auth

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R
import com.google.android.gms.common.GoogleApiAvailability
import kotlinx.coroutines.launch

@Composable
fun WelcomeScreen(viewModel: LoginViewModel) {
  Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFFFCEBA8)) {
    WelcomeScreenContent(viewModel = viewModel)
  }
}

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun WelcomeScreenContent(viewModel: LoginViewModel) {
  var registrationState by rememberSaveable { mutableStateOf(RegistrationState.AuthProviderButtons) }

  val onRegistrationStateChange = { state: RegistrationState ->
    registrationState = state
  }

  val snackBarHostState = remember { SnackbarHostState() }
  val coroutineScope = rememberCoroutineScope()
  val focusManager = LocalFocusManager.current

  Column(
    verticalArrangement = Arrangement.SpaceAround,
    horizontalAlignment = Alignment.Start,
    modifier = Modifier
      .fillMaxSize()
      .navigationBarsPadding()
      .padding(horizontal = 16.dp)
      .clickable { focusManager.clearFocus() }
  ) {
    Spacer(modifier = Modifier.height(50.dp))
    Image(
      painter = painterResource(id = R.drawable.ic_omnivore_name_logo),
      contentDescription = "Omnivore Icon with Name"
    )
    Spacer(modifier = Modifier.height(50.dp))

    when(registrationState) {
      RegistrationState.EmailSignIn -> {
        EmailLoginView(
          viewModel = viewModel,
          onAuthProviderButtonTap = {
            onRegistrationStateChange(RegistrationState.AuthProviderButtons)
          }
        )
      }
      RegistrationState.AuthProviderButtons -> {
        Text(
          text = stringResource(id = R.string.welcome_title),
          style = MaterialTheme.typography.headlineLarge
        )

        Text(
          text = stringResource(id = R.string.welcome_subtitle),
          style = MaterialTheme.typography.titleSmall
        )

        MoreInfoButton()

        Spacer(modifier = Modifier.height(50.dp))

        AuthProviderView(
          viewModel = viewModel,
          onEmailButtonTap = { onRegistrationStateChange(RegistrationState.EmailSignIn) }
        )
      }
    }

    Spacer(modifier = Modifier.weight(1.0F))
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

@Composable
fun AuthProviderView(
  viewModel: LoginViewModel,
  onEmailButtonTap: () -> Unit
) {
  val isGoogleAuthAvailable: Boolean = GoogleApiAvailability
    .getInstance()
    .isGooglePlayServicesAvailable(LocalContext.current) == 0

  Row(
    horizontalArrangement = Arrangement.Center
  ) {
    Spacer(modifier = Modifier.weight(1.0F))
    Column(
//      verticalArrangement = Arrangement.Center,
//      horizontalAlignment = Alignment.CenterHorizontally
              verticalArrangement = Arrangement.spacedBy(8.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      if (isGoogleAuthAvailable) {
        GoogleAuthButton(viewModel)
      }

      // AppleAuthButton(viewModel)

      ClickableText(
        text = AnnotatedString("Continue with Email"),
        style = MaterialTheme.typography.titleMedium
          .plus(TextStyle(textDecoration = TextDecoration.Underline)),
        onClick = { onEmailButtonTap() }
      )
    }
    Spacer(modifier = Modifier.weight(1.0F))
  }
}

@Composable
fun MoreInfoButton() {
  val context = LocalContext.current
  val intent = remember { Intent(Intent.ACTION_VIEW, Uri.parse("https://omnivore.app/about")) }

  ClickableText(
    text = AnnotatedString(
      stringResource(id = R.string.learn_more),
    ),
    style = MaterialTheme.typography.titleSmall
      .plus(TextStyle(textDecoration = TextDecoration.Underline)),
    onClick = {
      context.startActivity(intent)
    },
    modifier = Modifier.padding(vertical = 6.dp)
  )
}

