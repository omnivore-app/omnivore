package app.omnivore.omnivore.ui.auth

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import com.google.android.gms.common.GoogleApiAvailability

@Composable
fun SplashPage(viewModel: LoginViewModel, navController: NavHostController) {
    val isGoogleAuthAvailable: Boolean = GoogleApiAvailability
        .getInstance()
        .isGooglePlayServicesAvailable(LocalContext.current) == 0

    Column(
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .background(MaterialTheme.colorScheme.background)
            .fillMaxSize()
            .navigationBarsPadding()
    ) {
        Text("Never miss a great read")
        MoreInfoButton()

        if (isGoogleAuthAvailable) {
            GoogleAuthButton(viewModel)
        }

        ContinueWithEmailButton(navController)
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
        }
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
