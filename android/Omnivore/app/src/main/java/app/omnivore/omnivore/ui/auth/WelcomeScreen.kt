package app.omnivore.omnivore.ui.auth

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.Routes
import com.google.android.gms.common.GoogleApiAvailability

@Composable
fun WelcomeScreen(viewModel: LoginViewModel) {
//    val systemUiController = rememberSystemUiController()
//    systemUiController.isSystemBarsVisible = false

        Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFFFBEAA8 )) {
            WelcomeScreenContent(viewModel = viewModel)
        }
}

@Composable
fun WelcomeScreenContent(viewModel: LoginViewModel) {
    var registrationState by rememberSaveable { mutableStateOf(RegistrationState.AuthProviderButtons) }

    val onRegistrationStateChange = { state: RegistrationState ->
        registrationState = state
    }

        Column(
            verticalArrangement = Arrangement.SpaceAround,
            horizontalAlignment = Alignment.Start,
            modifier = Modifier
                .background(Color(0xFFFBEAA8))
                .fillMaxSize()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp)
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
                    AuthProviderView(
                        viewModel = viewModel,
                        onEmailButtonTap = { onRegistrationStateChange(RegistrationState.EmailSignIn) }
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1.0F))
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

    Text(
        text = stringResource(id = R.string.welcome_title),
        style = MaterialTheme.typography.headlineLarge
    )
    MoreInfoButton()

    Spacer(modifier = Modifier.height(50.dp))

    Row(
        horizontalArrangement = Arrangement.Center
    ) {
        Spacer(modifier = Modifier.weight(1.0F))
        Column(
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (isGoogleAuthAvailable) {
                GoogleAuthButton(viewModel)
            }

            LoadingButtonWithIcon(
                text = "Continue with Apple",
                loadingText = "Signing in...",
                icon = painterResource(id = R.drawable.ic_logo_apple),
                modifier = Modifier.padding(vertical = 6.dp),
                onClick = {}
            )

            ClickableText(
                text = AnnotatedString("Continue with Email ->"),
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
        text = AnnotatedString("Learn More ->"),
        style = MaterialTheme.typography.titleLarge,
        onClick = {
            context.startActivity(intent)
        },
    modifier = Modifier.padding(vertical = 6.dp)
    )
}

