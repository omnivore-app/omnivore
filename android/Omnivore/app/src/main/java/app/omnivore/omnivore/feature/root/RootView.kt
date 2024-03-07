package app.omnivore.omnivore.feature.root

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.feature.auth.LoginViewModel
import app.omnivore.omnivore.feature.auth.WelcomeScreen
import app.omnivore.omnivore.feature.components.LabelsViewModel
import app.omnivore.omnivore.feature.editinfo.EditInfoViewModel
import app.omnivore.omnivore.feature.library.LibraryView
import app.omnivore.omnivore.feature.library.SearchView
import app.omnivore.omnivore.feature.library.SearchViewModel
import app.omnivore.omnivore.feature.save.SaveViewModel
import app.omnivore.omnivore.feature.settings.SettingsScreen
import app.omnivore.omnivore.feature.settings.about.AboutScreen
import app.omnivore.omnivore.feature.settings.account.AccountScreen
import app.omnivore.omnivore.feature.web.WebViewScreen
import app.omnivore.omnivore.navigation.Routes

@Composable
fun RootView(
    loginViewModel: LoginViewModel,
    searchViewModel: SearchViewModel,
    labelsViewModel: LabelsViewModel,
    saveViewModel: SaveViewModel,
    editInfoViewModel: EditInfoViewModel,
) {
    val hasAuthToken: Boolean by loginViewModel.hasAuthTokenLiveData.observeAsState(false)
    val snackbarHostState = remember { SnackbarHostState() }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        Box(
            modifier = if (!hasAuthToken) Modifier.background(Color(0xFFFCEBA8)) else Modifier
                .fillMaxSize()
                .padding(padding)
                .consumeWindowInsets(padding)
                .windowInsetsPadding(
                    WindowInsets.safeDrawing.only(
                        WindowInsetsSides.Horizontal,
                    ),
                )
        ){
            if (hasAuthToken) {
                PrimaryNavigator(
                    loginViewModel = loginViewModel,
                    searchViewModel = searchViewModel,
                    labelsViewModel = labelsViewModel,
                    saveViewModel = saveViewModel,
                    editInfoViewModel = editInfoViewModel,
                    snackbarHostState = snackbarHostState

                )
            } else {
                WelcomeScreen(viewModel = loginViewModel)
            }

            DisposableEffect(hasAuthToken) {
                if (hasAuthToken) {
                    loginViewModel.registerUser()
                }
                onDispose {}
            }
        }
    }
}

@Composable
fun PrimaryNavigator(
    loginViewModel: LoginViewModel,
    searchViewModel: SearchViewModel,
    labelsViewModel: LabelsViewModel,
    saveViewModel: SaveViewModel,
    editInfoViewModel: EditInfoViewModel,
    snackbarHostState: SnackbarHostState
) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Routes.Library.route
    ) {
        composable(Routes.Library.route) {
            LibraryView(
                navController = navController,
                labelsViewModel = labelsViewModel,
                saveViewModel = saveViewModel,
                editInfoViewModel = editInfoViewModel,
            )
        }

        composable(Routes.Search.route) {
            SearchView(
                viewModel = searchViewModel, navController = navController
            )
        }

        composable(Routes.Settings.route) {
            SettingsScreen(
                loginViewModel = loginViewModel,
                navController = navController
            )
        }

        composable(Routes.About.route) {
            AboutScreen(
                navController = navController
            )
        }

        composable(Routes.Account.route) {
            AccountScreen(
                navController = navController,
                snackbarHostState = snackbarHostState,
            )
        }

        composable(Routes.Documentation.route) {
            WebViewScreen(navController = navController, url = "https://docs.omnivore.app")
        }

        composable(Routes.PrivacyPolicy.route) {
            WebViewScreen(navController = navController, url = "https://omnivore.app/privacy")
        }

        composable(Routes.TermsAndConditions.route) {
            WebViewScreen(navController = navController, url = "https://omnivore.app/app/terms")
        }
    }
}
