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
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.AutofillType
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.component.DividerWithText
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel
import app.omnivore.omnivore.feature.theme.OmnivoreTheme
import app.omnivore.omnivore.navigation.Routes
import app.omnivore.omnivore.utils.AuthUtils.autofill
import app.omnivore.omnivore.utils.FORGOT_PASSWORD_URL

@Composable
fun EmailSignInScreen(
    onboardingNavController: NavHostController,
    viewModel: OnboardingViewModel
) {
    OmnivoreTheme(darkTheme = false) {
        EmailSignInContent(onboardingNavController, viewModel)
    }
}

@Composable
fun EmailSignInContent(
    onboardingNavController: NavHostController,
    viewModel: OnboardingViewModel
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }

    Row(
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.padding(bottom = 64.dp)
    ) {
        Spacer(modifier = Modifier.weight(1.0F))
        Column(
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            LoginFields(
                email,
                password,
                onEmailChange = { email = it },
                onPasswordChange = { password = it },
                onLoginClick = { viewModel.login(email, password) },
                onCreateAccountClick = {
                    onboardingNavController.navigate(Routes.EmailSignUp.route)
                    viewModel.resetState()
                },
                isLoading = viewModel.isLoading
            )
        }
        Spacer(modifier = Modifier.weight(1.0F))
    }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun LoginFields(
    email: String,
    password: String,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onLoginClick: () -> Unit,
    onCreateAccountClick: () -> Unit,
    isLoading: Boolean
) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current
    val uriHandler = LocalUriHandler.current

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        OutlinedTextField(modifier = Modifier
            .autofill(autofillTypes = listOf(
                AutofillType.EmailAddress,
            ), onFill = { onEmailChange(it) })
            .fillMaxWidth(),
            value = email,
            placeholder = { Text(stringResource(R.string.email_login_field_placeholder_email)) },
            label = { Text(stringResource(R.string.email_login_field_label_email)) },
            onValueChange = onEmailChange,
            keyboardOptions = KeyboardOptions(
                imeAction = ImeAction.Done,
                keyboardType = KeyboardType.Email,
            ),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        OutlinedTextField(modifier = Modifier
            .autofill(autofillTypes = listOf(
                AutofillType.Password,
            ), onFill = { onPasswordChange(it) })
            .fillMaxWidth(),
            value = password,
            placeholder = { Text(stringResource(R.string.email_login_field_placeholder_password)) },
            label = { Text(stringResource(R.string.email_login_field_label_password)) },
            onValueChange = onPasswordChange,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                imeAction = ImeAction.Done,
                keyboardType = KeyboardType.Password,
            ),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        Row(
            horizontalArrangement = Arrangement.End,
            modifier = Modifier.fillMaxWidth()
        ) {
            TextButton(
                onClick = {
                    val uri = FORGOT_PASSWORD_URL
                    uriHandler.openUri(uri)
                }
            ) {
                Text(text = stringResource(R.string.forgot_password))
            }
        }

        OutlinedButton(
            modifier = Modifier.fillMaxWidth(),
            enabled = email.isNotBlank() && password.isNotBlank(),
            onClick = {
                if (email.isNotBlank() && password.isNotBlank()) {
                    onLoginClick()
                    focusManager.clearFocus()
                } else {
                    Toast.makeText(
                        context,
                        context.getString(R.string.email_login_error_msg),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }, colors = ButtonDefaults.buttonColors(
                contentColor = Color(0xFF3D3D3D), containerColor = Color(0xffffd234)
            )
        ) {
            Text(
                text = stringResource(R.string.email_login_action_login).uppercase()
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

        DividerWithText(text = "or")

        OutlinedButton(
            modifier = Modifier.fillMaxWidth(),
            onClick = { onCreateAccountClick() }
        ) {
            Text(
                text = "Create Account".uppercase()
            )
        }
    }
}
