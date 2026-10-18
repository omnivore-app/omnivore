package app.omnivore.omnivore.feature.onboarding.auth

import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel

@Composable
fun CreateUserScreen(
    viewModel: OnboardingViewModel,
    onboardingNavController: NavHostController
) {
    var name by rememberSaveable { mutableStateOf("") }
    var username by rememberSaveable { mutableStateOf("") }

    Row(
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.padding(bottom = 64.dp)
    ) {
        Spacer(modifier = Modifier.weight(1.0F))
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(
                text = stringResource(R.string.create_user_profile_title),
                color = MaterialTheme.colorScheme.onSurface,
                style = MaterialTheme.typography.headlineSmall,
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
                onSubmit = { viewModel.submitProfile(username = username, name = name) },
                isLoading = viewModel.isLoading
            )

            TextButton(
                onClick = {
                    viewModel.cancelNewUserSignUp()
                    onboardingNavController.popBackStack()
                }
            ) {
                Text(
                    text = stringResource(R.string.create_user_profile_action_cancel),
                    textDecoration = TextDecoration.Underline
                )
            }
        }
        Spacer(modifier = Modifier.weight(1.0F))
    }
}

@Composable
fun UserProfileFields(
    name: String,
    username: String,
    usernameValidationErrorMessage: String?,
    showUsernameAsAvailable: Boolean,
    onNameChange: (String) -> Unit,
    onUsernameChange: (String) -> Unit,
    onSubmit: () -> Unit,
    isLoading: Boolean
) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        OutlinedTextField(
            value = name,
            onValueChange = onNameChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(stringResource(R.string.create_user_profile_field_placeholder_name)) },
            label = { Text(stringResource(R.string.create_user_profile_field_label_name)) },
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        OutlinedTextField(
            value = username,
            onValueChange = onUsernameChange,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            placeholder = { Text(stringResource(R.string.create_user_profile_field_placeholder_username)) },
            label = { Text(stringResource(R.string.create_user_profile_field_label_username)) },
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
            trailingIcon = {
                if (showUsernameAsAvailable) {
                    Icon(
                        imageVector = Icons.Filled.CheckCircle, contentDescription = null
                    )
                }
            },
            isError = usernameValidationErrorMessage != null,
            supportingText = {
                if (usernameValidationErrorMessage != null) {
                    Text(
                        text = usernameValidationErrorMessage,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center
                    )
                }
            }
        )

        OutlinedButton(
            modifier = Modifier.fillMaxWidth(),
            onClick = {
                if (name.isNotBlank() && username.isNotBlank()) {
                    onSubmit()
                    focusManager.clearFocus()
                } else {
                    Toast.makeText(
                        context,
                        context.getString(R.string.create_user_profile_error_msg),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }, colors = ButtonDefaults.buttonColors(
                contentColor = Color(0xFF3D3D3D), containerColor = Color(0xffffd234)
            )
        ) {
            Text(
                text = stringResource(R.string.create_user_profile_action_submit),
                modifier = Modifier.padding(horizontal = 100.dp)
            )
            if (isLoading) {
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
    }
}
