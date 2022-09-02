package app.omnivore.omnivore.ui.root

import PdfLoader
import SettingsView
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.core.net.toUri
import androidx.lifecycle.ViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.auth.WelcomeScreen
import app.omnivore.omnivore.ui.home.HomeView
import app.omnivore.omnivore.ui.home.HomeViewModel
import app.omnivore.omnivore.ui.reader.ArticleWebView
import javax.inject.Inject

@Composable
fun RootView(loginViewModel: LoginViewModel, homeViewModel: HomeViewModel) {
  val hasAuthToken: Boolean by loginViewModel.hasAuthTokenLiveData.observeAsState(false)

  if (hasAuthToken) {
    PrimaryNavigator(loginViewModel = loginViewModel, homeViewModel = homeViewModel)
  } else {
    WelcomeScreen(viewModel = loginViewModel)
  }
}

@Composable
fun PrimaryNavigator(loginViewModel: LoginViewModel, homeViewModel: HomeViewModel){
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

    composable("PDFViewer/{url}") {
      val urlString = it.arguments?.getString("url") ?: ""
      PdfLoader(uri = urlString)
    }

    composable(Routes.Settings.route) {
      SettingsView(loginViewModel = loginViewModel, navController = navController)
    }
  }
}
