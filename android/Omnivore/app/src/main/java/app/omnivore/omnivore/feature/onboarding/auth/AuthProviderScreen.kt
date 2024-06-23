package app.omnivore.omnivore.feature.onboarding.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel
import app.omnivore.omnivore.feature.onboarding.auth.provider.AppleAuthButton
import app.omnivore.omnivore.feature.onboarding.auth.provider.GoogleAuthButton
import app.omnivore.omnivore.navigation.Routes
import com.google.android.gms.common.GoogleApiAvailability

@Composable
fun AuthProviderScreen(
    welcomeNavController: NavHostController,
    viewModel: OnboardingViewModel
) {
    val isGoogleAuthAvailable: Boolean =
        GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(LocalContext.current) == 0

    Row(
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth().padding(bottom = 64.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.width(500.dp)
        ) {
            if (isGoogleAuthAvailable) {
                GoogleAuthButton(viewModel)
            }

            AppleAuthButton(viewModel)

            OutlinedButton(
                onClick = {
                    welcomeNavController.navigate(Routes.EmailSignIn.route)
                    viewModel.resetState()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, end = 16.dp),
                shape = RoundedCornerShape(6.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Transparent,
                    contentColor = MaterialTheme.colorScheme.onSurface
                )
            ) {
                Text(text = stringResource(R.string.welcome_screen_action_continue_with_email), modifier = Modifier.padding(vertical = 6.dp))
            }

            Spacer(modifier = Modifier.weight(1.0F))

            TextButton(
                onClick = {
                    viewModel.resetState()
                    welcomeNavController.navigate(Routes.SelfHosting.route)
                },
                modifier = Modifier.padding(vertical = 10.dp),
                colors = ButtonDefaults.textButtonColors(
                    contentColor = MaterialTheme.colorScheme.onSurface
                )
            ){
                Text(
                    text = stringResource(R.string.welcome_screen_action_self_hosting_options),
                    textDecoration = TextDecoration.Underline
                )
            }
        }
    }
}
