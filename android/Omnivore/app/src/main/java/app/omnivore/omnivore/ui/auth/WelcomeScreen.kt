package app.omnivore.omnivore.ui.auth

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
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
fun WelcomeScreen(viewModel: LoginViewModel, navController: NavHostController) {
//    val systemUiController = rememberSystemUiController()
//    systemUiController.isSystemBarsVisible = false

        Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFFFBEAA8 )) {
            WelcomeScreenContent(viewModel = viewModel, navController = navController)
        }
}

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun WelcomeScreenContent(viewModel: LoginViewModel, navController: NavHostController) {
    val isGoogleAuthAvailable: Boolean = GoogleApiAvailability
        .getInstance()
        .isGooglePlayServicesAvailable(LocalContext.current) == 0

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
            Text(stringResource(id = R.string.welcome_title))
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
                        onClick = {}
                    )

                    ContinueWithEmailButton(navController)
                }
                Spacer(modifier = Modifier.weight(1.0F))
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
        onClick = {
            context.startActivity(intent)
        },
    modifier = Modifier.padding(vertical = 6.dp)
    )
}

@Composable
fun ContinueWithEmailButton(navController: NavHostController) {
    ClickableText(
        text = AnnotatedString("Continue with Email ->"),
        onClick = {
            navController.navigate(Routes.EmailLogin.route)
        }
    )
}
