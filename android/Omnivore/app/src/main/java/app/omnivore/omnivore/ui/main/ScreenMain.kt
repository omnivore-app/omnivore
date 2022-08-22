package app.omnivore.omnivore.ui.main

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.ui.auth.EmailLoginViewContainer
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.auth.WelcomeScreen
import app.omnivore.omnivore.ui.home.HomeView

@Composable
fun ScreenMain(viewModel: LoginViewModel) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Routes.Root.route) {
        composable(Routes.Root.route) {
            RootView(viewModel = viewModel, navController = navController)
        }
        composable(Routes.Welcome.route) {
            WelcomeScreen(viewModel = viewModel, navController = navController)
        }
        composable(Routes.Home.route) {
            HomeView(viewModel = viewModel, navController = navController)
        }
        composable(Routes.EmailLogin.route) {
            EmailLoginViewContainer(viewModel = viewModel, navController = navController)
        }
    }
}

@Composable
fun RootView(viewModel: LoginViewModel, navController: NavHostController) {
    val hasAuthToken: Boolean by viewModel.hasAuthTokenLiveData.observeAsState(false)

    if (hasAuthToken) {
        HomeView(viewModel = viewModel, navController = navController)
    } else {
        WelcomeScreen(viewModel = viewModel, navController = navController)
    }
}
