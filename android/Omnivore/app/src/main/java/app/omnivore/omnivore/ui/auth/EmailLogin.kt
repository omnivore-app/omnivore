package app.omnivore.omnivore.ui.auth

import android.annotation.SuppressLint
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import kotlinx.coroutines.launch

//@Composable
//fun EmailLoginViewContainer(viewModel: LoginViewModel, navController: NavHostController) {
//    Column(
//        verticalArrangement = Arrangement.Center,
//        horizontalAlignment = Alignment.CenterHorizontally,
//        modifier = Modifier
//            .background(MaterialTheme.colorScheme.background)
//            .fillMaxSize()
//            .navigationBarsPadding()
//    ) {
//        EmailLoginView(viewModel)
//    }
//}

@SuppressLint("CoroutineCreationDuringComposition")
@Composable
fun EmailLoginView(viewModel: LoginViewModel, onAuthProviderButtonTap: () -> Unit) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    val focusManager = LocalFocusManager.current
    val snackBarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    Column(
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .background(MaterialTheme.colorScheme.background)
            .fillMaxSize()
            .clickable { focusManager.clearFocus() }
    ) {
        LoginFields(
            email,
            password,
            onEmailChange = { email = it },
            onPasswordChange = { password = it },
            onLoginClick = { viewModel.login(email, password) }
        )

        // TODO: add a activity indicator (maybe after a delay?)
        if (viewModel.isLoading) {
            Text("Loading...")
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

        ClickableText(
            text = AnnotatedString("Continue with Google/Apple ->"),
            onClick = { onAuthProviderButtonTap() }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginFields(
    email: String,
    password: String,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onLoginClick: () -> Unit
) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(300.dp),
        verticalArrangement = Arrangement.spacedBy(25.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Never miss a great read")

        OutlinedTextField(
            value = email,
            placeholder = { Text(text = "user@email.com") },
            label = { Text(text = "email") },
            onValueChange = onEmailChange,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        OutlinedTextField(
            value = password,
            placeholder = { Text(text = "password") },
            label = { Text(text = "password") },
            onValueChange = onPasswordChange,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
        )

        Button(onClick = {
            if (email.isNotBlank() && password.isNotBlank()) {
                onLoginClick()
                focusManager.clearFocus()
            } else {
                Toast.makeText(
                    context,
                    "Please enter an email address and password.",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }) {
            Text(text = "Login")
        }
    }
}
