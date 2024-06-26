package app.omnivore.omnivore.feature.root

import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
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
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.res.vectorResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.navigation
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.core.designsystem.theme.OmnivoreBrand
import app.omnivore.omnivore.feature.onboarding.OnboardingViewModel
import app.omnivore.omnivore.feature.onboarding.OnboardingScreen
import app.omnivore.omnivore.feature.following.FollowingScreen
import app.omnivore.omnivore.feature.library.LibraryView
import app.omnivore.omnivore.feature.library.SearchView
import app.omnivore.omnivore.feature.profile.SettingsScreen
import app.omnivore.omnivore.feature.profile.about.AboutScreen
import app.omnivore.omnivore.feature.profile.account.AccountScreen
import app.omnivore.omnivore.feature.profile.filters.FiltersScreen
import app.omnivore.omnivore.feature.web.WebViewScreen
import app.omnivore.omnivore.navigation.OmnivoreNavHost
import app.omnivore.omnivore.navigation.Routes
import app.omnivore.omnivore.navigation.TopLevelDestination

@Composable
fun RootView(
    onboardingViewModel: OnboardingViewModel = hiltViewModel()
) {

    val snackbarHostState = remember { SnackbarHostState() }
    val navController = rememberNavController()

    val followingTabActive by onboardingViewModel.followingTabActiveState.collectAsStateWithLifecycle()
    val hasAuthToken by onboardingViewModel.hasAuthTokenState.collectAsStateWithLifecycle()

    val destinations = if (followingTabActive) {
        TopLevelDestination.entries
    } else {
        TopLevelDestination.entries.filter { it.route != Routes.Following.route }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
        if (navController.currentBackStackEntryAsState().value?.destination?.route in TopLevelDestination.entries.map { it.route }) {
            OmnivoreBottomBar(
                navController,
                destinations,
                navController.currentBackStackEntryAsState().value?.destination
            )
        }
    }) { padding ->
        Box(
            modifier = if (!hasAuthToken) Modifier.background(OmnivoreBrand) else Modifier
                .fillMaxSize()
                .padding(padding)
                .consumeWindowInsets(padding)
                .windowInsetsPadding(
                    WindowInsets.safeDrawing.only(
                        WindowInsetsSides.Horizontal,
                    ),
                )
        ) {
            val startDestination = if (hasAuthToken) Routes.Home.route else Routes.Welcome.route
            PrimaryNavigator(
                navController = navController,
                snackbarHostState = snackbarHostState,
                startDestination = startDestination
            )
            LaunchedEffect(hasAuthToken) {
                if (hasAuthToken) {
                    onboardingViewModel.registerUser()
                }
            }
        }
    }
}



@Composable
fun PrimaryNavigator(
    navController: NavHostController,
    snackbarHostState: SnackbarHostState,
    startDestination: String
) {

    OmnivoreNavHost(
        navController = navController,
        startDestination = startDestination
    ) {

        composable(Routes.Welcome.route) {
            OnboardingScreen()
        }

        navigation(
            startDestination = Routes.Inbox.route,
            route = Routes.Home.route,
            enterTransition = { EnterTransition.None },
            exitTransition = { ExitTransition.None },
            popEnterTransition = { EnterTransition.None },
            popExitTransition = { ExitTransition.None }
        ) {

            composable(Routes.Inbox.route) {
                LibraryView(navController = navController)
            }

            composable(Routes.Following.route) {
                FollowingScreen(navController = navController)
            }

            composable(Routes.Settings.route) {
                SettingsScreen(navController = navController)
            }
        }

        composable(Routes.Search.route) {
            SearchView(navController = navController)
        }

        composable(Routes.About.route) {
            AboutScreen(navController = navController)
        }

        composable(Routes.Filters.route) {
            FiltersScreen(navController = navController)
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

@Composable
private fun OmnivoreBottomBar(
    navController: NavHostController,
    destinations: List<TopLevelDestination>,
    currentDestination: NavDestination?
) {

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.background
    ) {
        destinations.forEach { screen ->
            val icon = if (screen.route == currentDestination?.route) {
                ImageVector.vectorResource(id = screen.selectedIcon)
            } else {
                ImageVector.vectorResource(id = screen.unselectedIcon)
            }
            NavigationBarItem(icon = {
                Icon(
                    icon, contentDescription = stringResource(id = screen.iconTextId)
                )
            },
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
                })
        }
    }
}
