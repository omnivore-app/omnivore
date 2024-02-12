package app.omnivore.omnivore.feature.root

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.navigation.Routes
import app.omnivore.omnivore.feature.auth.LoginViewModel
import app.omnivore.omnivore.feature.auth.WelcomeScreen
import app.omnivore.omnivore.feature.components.LabelsViewModel
import app.omnivore.omnivore.feature.editinfo.EditInfoViewModel
import app.omnivore.omnivore.feature.library.LibraryView
import app.omnivore.omnivore.feature.library.LibraryViewModel
import app.omnivore.omnivore.feature.library.SearchView
import app.omnivore.omnivore.feature.library.SearchViewModel
import app.omnivore.omnivore.feature.save.SaveViewModel
import app.omnivore.omnivore.feature.settings.PolicyWebView
import app.omnivore.omnivore.feature.settings.SettingsView
import app.omnivore.omnivore.feature.settings.SettingsViewModel

@Composable
fun RootView(
    loginViewModel: LoginViewModel,
    searchViewModel: SearchViewModel,
    libraryViewModel: LibraryViewModel,
    settingsViewModel: SettingsViewModel,
    labelsViewModel: LabelsViewModel,
    saveViewModel: SaveViewModel,
    editInfoViewModel: EditInfoViewModel,
) {
    val hasAuthToken: Boolean by loginViewModel.hasAuthTokenLiveData.observeAsState(false)

    Box {
        if (hasAuthToken) {
            PrimaryNavigator(
                loginViewModel = loginViewModel,
                searchViewModel = searchViewModel,
                libraryViewModel = libraryViewModel,
                settingsViewModel = settingsViewModel,
                labelsViewModel = labelsViewModel,
                saveViewModel = saveViewModel,
                editInfoViewModel = editInfoViewModel,
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

@Composable
fun PrimaryNavigator(
    loginViewModel: LoginViewModel,
    libraryViewModel: LibraryViewModel,
    searchViewModel: SearchViewModel,
    settingsViewModel: SettingsViewModel,
    labelsViewModel: LabelsViewModel,
    saveViewModel: SaveViewModel,
    editInfoViewModel: EditInfoViewModel,
) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Routes.Library.route) {
        composable(Routes.Library.route) {
            LibraryView(
                libraryViewModel = libraryViewModel,
                navController = navController,
                labelsViewModel = labelsViewModel,
                saveViewModel = saveViewModel,
                editInfoViewModel = editInfoViewModel,
            )
        }

        composable(Routes.Search.route) {
            SearchView(
                viewModel = searchViewModel,
                navController = navController
            )
        }

        composable(Routes.Settings.route) {
            SettingsView(
                loginViewModel = loginViewModel,
                settingsViewModel = settingsViewModel,
                navController = navController
            )
        }

        composable(Routes.Documentation.route) {
            PolicyWebView(navController = navController, url = "https://docs.omnivore.app")
        }

        composable(Routes.PrivacyPolicy.route) {
            PolicyWebView(navController = navController, url = "https://omnivore.app/privacy")
        }

        composable(Routes.TermsAndConditions.route) {
            PolicyWebView(navController = navController, url = "https://omnivore.app/app/terms")
        }
    }
}
