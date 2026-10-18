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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel
import app.omnivore.omnivore.utils.AuthUtils.autofill

@Composable
fun EmailSignUpScreen(
    viewModel: OnboardingViewModel
) {
    EmailSignUpForm(viewModel = viewModel)
}

@Composable
fun EmailSignUpForm(
    viewModel: OnboardingViewModel
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var name by rememberSaveable { mutableStateOf("") }
    var username by rememberSaveable { mutableStateOf("") }

    Row(
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.padding(bottom = 64.dp)
    ) {
        Spacer(modifier = Modifier.weight(1.0F))
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            EmailSignUpFields(
                email = email,
                password = password,
                name = name,
                username = username,
                usernameValidationErrorMessage = viewModel.usernameValidationErrorMessage,
                showUsernameAsAvailable = viewModel.hasValidUsername,
                onEmailChange = { email = it },
                onPasswordChange = { password = it },
                onNameChange = { name = it },
                onUsernameChange = {
                    username = it
                    viewModel.validateUsername(it)
                },
                onSubmit = {
                    viewModel.submitEmailSignUp(
                        email = email, password = password, username = username, name = name
                    )
                },
                isLoading = viewModel.isLoading
            )
        }
        Spacer(modifier = Modifier.weight(1.0F))
    }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun EmailSignUpFields(
    email: String,
    password: String,
    name: String,
    username: String,
    usernameValidationErrorMessage: String?,
    showUsernameAsAvailable: Boolean,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onNameChange: (String) -> Unit,
    onUsernameChange: (String) -> Unit,
    onSubmit: () -> Unit,
    isLoading: Boolean
) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current

    Column(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        OutlinedTextField(
            modifier = Modifier
                .autofill(
                    autofillTypes = listOf(AutofillType.EmailAddress),
                    onFill = { onEmailChange(it) }
                )
                .fillMaxWidth(),
            value = email,
            placeholder = { Text(stringResource(R.string.email_signup_field_placeholder_email)) },
            label = { Text(stringResource(R.string.email_signup_field_label_email)) },
            onValueChange = onEmailChange,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        OutlinedTextField(modifier = Modifier.autofill(autofillTypes = listOf(
            AutofillType.Password,
        ), onFill = { onPasswordChange(it) }).fillMaxWidth(),
            value = password,
            placeholder = { Text(stringResource(R.string.email_signup_field_placeholder_password)) },
            label = { Text(stringResource(R.string.email_signup_field_label_password)) },
            onValueChange = onPasswordChange,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = name,
            placeholder = { Text(stringResource(R.string.email_signup_field_placeholder_name)) },
            label = { Text(stringResource(R.string.email_signup_field_label_name)) },
            onValueChange = onNameChange,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        OutlinedTextField(
            modifier = Modifier.fillMaxWidth().padding(bottom = 32.dp),
            value = username,
            placeholder = { Text(stringResource(R.string.email_signup_field_placeholder_username)) },
            label = { Text(stringResource(R.string.email_signup_field_label_username)) },
            onValueChange = onUsernameChange,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
            isError = usernameValidationErrorMessage != null,
            trailingIcon = {
                if (showUsernameAsAvailable) {
                    Icon(
                        imageVector = Icons.Filled.CheckCircle, contentDescription = null
                    )
                }
            },
            supportingText = {
                if (usernameValidationErrorMessage != null) {
                    Text(
                        text = usernameValidationErrorMessage,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Left
                    )
                }
            }
        )

        OutlinedButton(
            modifier = Modifier.fillMaxWidth(),
            onClick = {
                if (email.isNotBlank() && password.isNotBlank() && username.isNotBlank() && name.isNotBlank()) {
                    onSubmit()
                    focusManager.clearFocus()
                } else {
                    Toast.makeText(
                        context,
                        context.getString(R.string.email_signup_error_msg),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }, colors = ButtonDefaults.buttonColors(
                contentColor = Color(0xFF3D3D3D), containerColor = Color(0xffffd234)
            )
        ) {
            Text(
                text = stringResource(R.string.email_signup_action_sign_up).uppercase()
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
