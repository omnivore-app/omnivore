package app.omnivore.omnivore.feature.onboarding.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.theme.Success
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel

@Composable
fun EmailConfirmationScreen(
    viewModel: OnboardingViewModel,
    onboardingNavController: NavHostController
) {
    val email = viewModel.pendingEmailUserCreds.value?.email ?: ""
    val password = viewModel.pendingEmailUserCreds.value?.password ?: ""

    Row(
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.padding(bottom = 64.dp)
    ) {
        Spacer(modifier = Modifier.weight(1.0F))
        Column(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = stringResource(R.string.email_signup_verification_message, email),
                color = Success,
                style = MaterialTheme.typography.titleMedium
            )

            OutlinedButton(
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    viewModel.login(email, password)
                }, colors = ButtonDefaults.buttonColors(
                    contentColor = Color(0xFF3D3D3D), containerColor = Color(0xffffd234)
                )
            ) {
                Text(
                    text = stringResource(R.string.email_signup_check_status).uppercase()
                )
                if (viewModel.isLoading) {
                    Spacer(modifier = Modifier.width(16.dp))
                    CircularProgressIndicator(
                        modifier = Modifier
                            .height(16.dp)
                            .width(16.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            TextButton(
                onClick = {
                    viewModel.resetState()
                    onboardingNavController.popBackStack()
                }
            ){
                Text(
                    text = stringResource(R.string.email_signup_action_use_different_email),
                    textDecoration = TextDecoration.Underline
                )
            }
        }
    }
}
