package app.omnivore.omnivore.ui.root

import SettingsView
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.auth.WelcomeScreen
import app.omnivore.omnivore.ui.home.HomeView
import app.omnivore.omnivore.ui.home.HomeViewModel
import app.omnivore.omnivore.ui.reader.ArticleWebView

@Composable
fun RootView(
  loginViewModel: LoginViewModel,
  homeViewModel: HomeViewModel,
  modifier: Modifier
) {
  val hasAuthToken: Boolean by loginViewModel.hasAuthTokenLiveData.observeAsState(false)

  if (hasAuthToken) {
    PrimaryNavigator(
      loginViewModel = loginViewModel,
      homeViewModel = homeViewModel,
      modifier = modifier
    )
  } else {
    WelcomeScreen(viewModel = loginViewModel)
  }
}

@Composable
fun PrimaryNavigator(
  loginViewModel: LoginViewModel,
  homeViewModel: HomeViewModel,
  modifier: Modifier
) {
  val navController = rememberNavController()

  NavHost(navController = navController, startDestination = Routes.Home.route) {
    composable(Routes.Home.route) {
      HomeView(
        homeViewModel = homeViewModel,
        navController = navController,
        modifier = modifier
      )
    }

    // TODO: add modifiers
    composable("WebReader/{slug}") {
      ArticleWebView(
        it.arguments?.getString("slug") ?: "",
        authCookieString = loginViewModel.getAuthCookieString() ?: ""
      )
    }

    composable(Routes.Settings.route) {
      SettingsView(loginViewModel = loginViewModel, navController = navController)
    }
  }
}
