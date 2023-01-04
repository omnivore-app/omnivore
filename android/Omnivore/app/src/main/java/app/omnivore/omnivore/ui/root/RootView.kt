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
import app.omnivore.omnivore.ui.library.LibraryView
import app.omnivore.omnivore.ui.library.LibraryViewModel
import app.omnivore.omnivore.ui.reader.*
import com.google.accompanist.systemuicontroller.rememberSystemUiController

@Composable
fun RootView(
  loginViewModel: LoginViewModel,
  libraryViewModel: LibraryViewModel,
  webReaderViewModel: WebReaderViewModel
) {
  val hasAuthToken: Boolean by loginViewModel.hasAuthTokenLiveData.observeAsState(false)
  val systemUiController = rememberSystemUiController()
  val useDarkIcons = !isSystemInDarkTheme()

  DisposableEffect(systemUiController, useDarkIcons) {
    systemUiController.setSystemBarsColor(
      color = Color.Black,
      darkIcons = false
    )

    onDispose {}
  }

  Box(
    modifier = Modifier
      .systemBarsPadding()
  ) {
    if (hasAuthToken) {
      PrimaryNavigator(
        loginViewModel = loginViewModel,
        libraryViewModel = libraryViewModel,
        webReaderViewModel = webReaderViewModel
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
  webReaderViewModel: WebReaderViewModel
) {
  val navController = rememberNavController()

  NavHost(navController = navController, startDestination = Routes.Library.route) {
    composable(Routes.Library.route) {
      LibraryView(
        libraryViewModel = libraryViewModel,
        navController = navController
      )
    }

    // TODO: delete this route and views
    composable("WebAppReader/{slug}") {
      ArticleWebView(
        it.arguments?.getString("slug") ?: "",
        authCookieString = loginViewModel.getAuthCookieString() ?: ""
      )
    }

    composable("WebReader/{slug}") {
      webReaderViewModel.reset() // clear previously loaded item

      WebReaderLoadingContainer(
        it.arguments?.getString("slug") ?: "",
        webReaderViewModel = webReaderViewModel
      )
    }

    composable(Routes.Settings.route) {
      SettingsView(loginViewModel = loginViewModel, navController = navController)
    }
  }
}
