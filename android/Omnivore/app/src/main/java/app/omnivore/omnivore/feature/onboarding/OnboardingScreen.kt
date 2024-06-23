package app.omnivore.omnivore.feature.onboarding

import android.content.Intent
import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowInsetsControllerCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.theme.OmnivoreBrand
import app.omnivore.omnivore.feature.onboarding.auth.AuthProviderScreen
import app.omnivore.omnivore.feature.onboarding.auth.CreateUserScreen
import app.omnivore.omnivore.feature.onboarding.auth.EmailConfirmationScreen
import app.omnivore.omnivore.feature.onboarding.auth.EmailSignInScreen
import app.omnivore.omnivore.feature.onboarding.auth.EmailSignUpScreen
import app.omnivore.omnivore.feature.onboarding.auth.SelfHostedScreen
import app.omnivore.omnivore.feature.theme.OmnivoreTheme
import app.omnivore.omnivore.navigation.OmnivoreNavHost
import app.omnivore.omnivore.navigation.Routes

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnboardingScreen(
    viewModel: OnboardingViewModel = hiltViewModel()
) {

    val activity = LocalContext.current as ComponentActivity
    val onboardingNavController = rememberNavController()
    val snackBarHostState = remember { SnackbarHostState() }

    val currentRoute by onboardingNavController.currentBackStackEntryFlow.collectAsState(
        initial = onboardingNavController.currentBackStackEntry
    )

    val errorMessage by viewModel.errorMessage.collectAsStateWithLifecycle()
    val navigateToCreateUser by viewModel.navigateToCreateUser.collectAsStateWithLifecycle()
    val pendingEmailUserCreds by viewModel.pendingEmailUserCreds.collectAsStateWithLifecycle()

    LaunchedEffect(key1 = errorMessage) {
        errorMessage?.let { message ->
            val result = snackBarHostState.showSnackbar(
                message = message,
                actionLabel = "Dismiss",
                duration = SnackbarDuration.Indefinite
            )
            when (result) {
                SnackbarResult.ActionPerformed -> viewModel.resetErrorMessage()
                else -> {}
            }
        }
    }

    LaunchedEffect(navigateToCreateUser) {
        if (navigateToCreateUser) {
            onboardingNavController.navigate(Routes.CreateUser.route)
            viewModel.onNavigateToCreateUserHandled()
        }
    }

    LaunchedEffect(pendingEmailUserCreds) {
        if (pendingEmailUserCreds != null) {
            onboardingNavController.navigate(Routes.EmailConfirmation.route)
            viewModel.onNavigateToEmailConfirmationHandled()
        }
    }

    OmnivoreTheme(darkTheme = false) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { },
                    navigationIcon = {
                        if (currentRoute?.destination?.route != Routes.AuthProvider.route) {
                            IconButton(onClick = { onboardingNavController.popBackStack() }) {
                                Icon(imageVector = Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = "Back")
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = OmnivoreBrand
                    )
                )
            },
            modifier = Modifier
                .fillMaxSize()
                .imePadding(),
            snackbarHost = { SnackbarHost(hostState = snackBarHostState) },
            containerColor = OmnivoreBrand
        ) { paddingValues ->
            LazyColumn(
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.Start,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
                    .padding(paddingValues)
            ) {
                item {
                    WelcomeHeader()
                }
                item {
                    OmnivoreNavHost(
                        navController = onboardingNavController,
                        startDestination = Routes.AuthProvider.route
                    ) {
                        composable(Routes.AuthProvider.route) {
                            AuthProviderScreen(
                                welcomeNavController = onboardingNavController,
                                viewModel = viewModel
                            )
                        }
                        composable(Routes.EmailSignIn.route) {
                            EmailSignInScreen(
                                onboardingNavController = onboardingNavController,
                                viewModel = viewModel
                            )
                        }
                        composable(Routes.EmailSignUp.route) {
                            EmailSignUpScreen(viewModel = viewModel)
                        }
                        composable(Routes.EmailConfirmation.route) {
                            EmailConfirmationScreen(
                                viewModel = viewModel,
                                onboardingNavController = onboardingNavController
                            )
                        }
                        composable(Routes.SelfHosting.route){
                            SelfHostedScreen(viewModel = viewModel)
                        }
                        composable(Routes.CreateUser.route){
                            CreateUserScreen(
                                viewModel = viewModel,
                                onboardingNavController = onboardingNavController
                            )
                        }
                    }
                }
            }
        }

        // Set the light status bar
        DisposableEffect(Unit) {
            val windowInsetsController = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
            val originalAppearanceLightStatusBars = windowInsetsController.isAppearanceLightStatusBars
            val originalStatusBarColor = activity.window.statusBarColor

            // Set light status bar
            windowInsetsController.isAppearanceLightStatusBars = true
            activity.window.statusBarColor = Color.Transparent.toArgb()

            onDispose {
                // Restore original status bar settings
                windowInsetsController.isAppearanceLightStatusBars = originalAppearanceLightStatusBars
                activity.window.statusBarColor = originalStatusBarColor
            }
        }
    }
}

@Composable
fun WelcomeHeader() {
    Column(
        modifier = Modifier.padding(bottom = 64.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_omnivore_name_logo),
            contentDescription = "Omnivore Icon with Name"
        )
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
