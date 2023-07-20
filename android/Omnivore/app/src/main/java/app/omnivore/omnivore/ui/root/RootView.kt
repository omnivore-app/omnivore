package app.omnivore.omnivore.ui.root

import SettingsView
import androidx.annotation.StringRes
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavController
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.R
import androidx.compose.ui.res.painterResource
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.dataService.DataService
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.auth.WelcomeScreen
import app.omnivore.omnivore.ui.components.LabelsViewModel
import app.omnivore.omnivore.ui.library.LibraryView
import app.omnivore.omnivore.ui.library.SearchView
import app.omnivore.omnivore.ui.library.LibraryViewModel
import app.omnivore.omnivore.ui.library.SearchViewModel
import app.omnivore.omnivore.ui.settings.PolicyWebView
import app.omnivore.omnivore.ui.settings.SettingsViewModel
import com.apollographql.apollo3.api.json.BufferedSinkJsonWriter.Companion.string
import com.google.accompanist.systemuicontroller.rememberSystemUiController

@Composable
fun RootView(
  loginViewModel: LoginViewModel,
  searchViewModel: SearchViewModel,
  libraryViewModel: LibraryViewModel,
  settingsViewModel: SettingsViewModel,
  labelsViewModel: LabelsViewModel
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
        searchViewModel = searchViewModel,
        libraryViewModel = libraryViewModel,
        settingsViewModel = settingsViewModel,
        labelsViewModel = labelsViewModel,
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

sealed class Screen(val route: String, val title: String, val imageResource: Int) {
  object Subscriptions : Screen("tab_subscriptions.xml", "Subscriptions", R.drawable.tab_subscriptions)
  object Library : Screen("library", "Library", R.drawable.tab_library)
  object Highlights : Screen("highlights", "Highlights", R.drawable.tab_highlights)
}

@Composable
fun PrimaryNavigator(
  loginViewModel: LoginViewModel,
  libraryViewModel: LibraryViewModel,
  searchViewModel: SearchViewModel,
  settingsViewModel: SettingsViewModel,
  labelsViewModel: LabelsViewModel,
) {
  val navController = rememberNavController()
//
//  NavHost(navController = navController, startDestination = Routes.Library.route) {
//    composable(Routes.Library.route) {
//      LibraryView(
//        libraryViewModel = libraryViewModel,
//        navController = navController,
//        labelsViewModel = labelsViewModel,
//      )
//    }
//
//    composable(Routes.Search.route) {
//      SearchView(
//        viewModel = searchViewModel,
//        navController = navController
//      )
//    }
//
//    composable(Routes.Settings.route) {
//      SettingsView(loginViewModel = loginViewModel, settingsViewModel = settingsViewModel, navController = navController)
//    }
//
//    composable(Routes.Documentation.route) {
//      PolicyWebView(navController = navController, url = "https://docs.omnivore.app")
//    }
//
//    composable(Routes.PrivacyPolicy.route) {
//      PolicyWebView(navController = navController, url = "https://omnivore.app/privacy")
//    }
//
//    composable(Routes.TermsAndConditions.route) {
//      PolicyWebView(navController = navController, url = "https://omnivore.app/app/terms")
//    }
//  }

  val items = listOf(
    Screen.Subscriptions,
    Screen.Library,
    Screen.Highlights,
  )

  Scaffold(
    bottomBar = {
      BottomNavigation(
        backgroundColor = MaterialTheme.colorScheme.background
      ) {
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentDestination = navBackStackEntry?.destination
        items.forEach { screen ->
          BottomNavigationItem(
            icon = {
              androidx.compose.material3.Icon(
                painter = painterResource(id = screen.imageResource),
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onBackground
              )
            },
            label = { Text(screen.title, color = MaterialTheme.colorScheme.onBackground) },
            selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
            onClick = {
              navController.navigate(screen.route) {
                // Pop up to the start destination of the graph to
                // avoid building up a large stack of destinations
                // on the back stack as users select items
                popUpTo(navController.graph.findStartDestination().id) {
                  saveState = true
                }
                // Avoid multiple copies of the same destination when
                // reselecting the same item
                launchSingleTop = true
                // Restore state when reselecting a previously selected item
                restoreState = true
              }
            }
          )
        }
      }
    }
  ) { innerPadding ->
    NavHost(navController, startDestination = Screen.Library.route, Modifier.padding(innerPadding)) {
      composable(Screen.Subscriptions.route) {
        LibraryView(
          libraryViewModel = libraryViewModel,
          navController = navController,
          labelsViewModel = labelsViewModel,
        )
      }
      composable(Screen.Library.route) {
        LibraryView(
          libraryViewModel = libraryViewModel,
          navController = navController,
          labelsViewModel = labelsViewModel,
        )
      }
      composable(Screen.Highlights.route) {
        LibraryView(
          libraryViewModel = libraryViewModel,
          navController = navController,
          labelsViewModel = labelsViewModel,
        )
      }
    }
  }
}
