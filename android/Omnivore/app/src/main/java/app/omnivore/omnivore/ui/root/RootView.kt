package app.omnivore.omnivore.ui.root

import SettingsView
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.auth.WelcomeScreen
import app.omnivore.omnivore.ui.home.HomeView
import app.omnivore.omnivore.ui.home.HomeViewModel
import app.omnivore.omnivore.ui.reader.ArticleWebView
import com.google.accompanist.systemuicontroller.rememberSystemUiController

@Composable
fun RootView(
  loginViewModel: LoginViewModel,
  homeViewModel: HomeViewModel
) {
  val hasAuthToken: Boolean by loginViewModel.hasAuthTokenLiveData.observeAsState(false)
  // Remember a SystemUiController
  val systemUiController = rememberSystemUiController()
  val useDarkIcons = !isSystemInDarkTheme()

  DisposableEffect(systemUiController, useDarkIcons) {
    // Update all of the system bar colors to be transparent, and use
    // dark icons if we're in light theme
    systemUiController.setSystemBarsColor(
      color = Color.Black,
      darkIcons = false
    )

    // setStatusBarColor() and setNavigationBarColor() also exist

    onDispose {}
  }

  Box(
    modifier = Modifier
      .systemBarsPadding()
  ) {
    if (hasAuthToken) {
      PrimaryNavigator(
        loginViewModel = loginViewModel,
        homeViewModel = homeViewModel
      )
    } else {
      WelcomeScreen(viewModel = loginViewModel)
    }
  }
}

@Composable
fun PrimaryNavigator(
  loginViewModel: LoginViewModel,
  homeViewModel: HomeViewModel
) {
  val navController = rememberNavController()

  NavHost(navController = navController, startDestination = Routes.Home.route) {
    composable(Routes.Home.route) {
      HomeView(
        homeViewModel = homeViewModel,
        navController = navController
      )
    }

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
