package app.omnivore.omnivore.feature.auth

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.theme.OmnivoreTheme
import com.google.android.gms.common.GoogleApiAvailability
import kotlinx.coroutines.launch

@Composable
fun WelcomeScreen(viewModel: LoginViewModel) {
    OmnivoreTheme(darkTheme = false) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFFFCEBA8)
        ) {
            WelcomeScreenContent(viewModel = viewModel)
        }
    }
}

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun WelcomeScreenContent(viewModel: LoginViewModel) {
    val registrationState: RegistrationState by viewModel.registrationStateLiveData.observeAsState(
            RegistrationState.SocialLogin
        )

    val snackBarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    Column(
        verticalArrangement = Arrangement.SpaceAround,
        horizontalAlignment = Alignment.Start,
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Spacer(modifier = Modifier.height(50.dp))
        Image(
            painter = painterResource(id = R.drawable.ic_omnivore_name_logo),
            contentDescription = "Omnivore Icon with Name"
        )
        Spacer(modifier = Modifier.height(50.dp))

        when (registrationState) {
            RegistrationState.EmailSignIn -> {
                EmailLoginView(viewModel = viewModel)
            }

            RegistrationState.EmailSignUp -> {
                EmailSignUpView(viewModel = viewModel)
            }

            RegistrationState.SelfHosted -> {
                SelfHostedView(viewModel = viewModel)
            }

            RegistrationState.SocialLogin -> {
                Text(
                    text = stringResource(id = R.string.welcome_title),
                    color = MaterialTheme.colorScheme.onSurface,
                    style = MaterialTheme.typography.headlineLarge
                )

                Text(
                    text = stringResource(id = R.string.welcome_subtitle),
                    color = MaterialTheme.colorScheme.onSurface,
                    style = MaterialTheme.typography.titleSmall
                )

                MoreInfoButton()

                Spacer(modifier = Modifier.height(50.dp))

                AuthProviderView(viewModel = viewModel)
            }

            RegistrationState.PendingUser -> {
                CreateUserProfileView(viewModel = viewModel)
            }
        }

        Spacer(modifier = Modifier.weight(1.0F))
    }

    if (viewModel.errorMessage != null) {
        coroutineScope.launch {
            val result = snackBarHostState.showSnackbar(
                    viewModel.errorMessage!!,
                    actionLabel = "Dismiss",
                    duration = SnackbarDuration.Indefinite
                )
            when (result) {
                SnackbarResult.ActionPerformed -> viewModel.resetErrorMessage()
                else -> {}
            }
        }

        SnackbarHost(hostState = snackBarHostState)
    }
}

@Composable
fun AuthProviderView(viewModel: LoginViewModel) {
    val isGoogleAuthAvailable: Boolean =
        GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(LocalContext.current) == 0

    Row(
        horizontalArrangement = Arrangement.Center
    ) {
        Spacer(modifier = Modifier.weight(1.0F))
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (isGoogleAuthAvailable) {
                GoogleAuthButton(viewModel)
            }

            AppleAuthButton(viewModel)

            ClickableText(text = AnnotatedString(stringResource(R.string.welcome_screen_action_continue_with_email)),
                style = MaterialTheme.typography.titleMedium.plus(TextStyle(textDecoration = TextDecoration.Underline)),
                onClick = { viewModel.showEmailSignIn() })

            Spacer(modifier = Modifier.weight(1.0F))

            ClickableText(
                text = AnnotatedString(stringResource(R.string.welcome_screen_action_self_hosting_options)),
                style = MaterialTheme.typography.titleMedium.plus(TextStyle(textDecoration = TextDecoration.Underline)),
                onClick = { viewModel.showSelfHostedSettings() },
                modifier = Modifier.padding(vertical = 10.dp)
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
        style = MaterialTheme.typography.titleSmall.plus(TextStyle(textDecoration = TextDecoration.Underline)),
        onClick = {
            context.startActivity(intent)
        },
        modifier = Modifier.padding(vertical = 6.dp)
    )
}
