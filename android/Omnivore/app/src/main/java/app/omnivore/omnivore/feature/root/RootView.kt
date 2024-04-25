package app.omnivore.omnivore.feature.root

import androidx.compose.animation.core.FastOutLinearInEasing
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
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
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.res.vectorResource
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.core.designsystem.util.ForIncoming
import app.omnivore.omnivore.core.designsystem.util.ForOutgoing
import app.omnivore.omnivore.core.designsystem.util.MotionConstants.DEFAULT_MOTION_DURATION
import app.omnivore.omnivore.core.designsystem.util.rememberSlideDistance
import app.omnivore.omnivore.feature.auth.LoginViewModel
import app.omnivore.omnivore.feature.auth.WelcomeScreen
import app.omnivore.omnivore.feature.components.LabelsViewModel
import app.omnivore.omnivore.feature.editinfo.EditInfoViewModel
import app.omnivore.omnivore.feature.following.FollowingScreen
import app.omnivore.omnivore.feature.library.LibraryView
import app.omnivore.omnivore.feature.library.SearchView
import app.omnivore.omnivore.feature.library.SearchViewModel
import app.omnivore.omnivore.feature.profile.SettingsScreen
import app.omnivore.omnivore.feature.profile.about.AboutScreen
import app.omnivore.omnivore.feature.profile.account.AccountScreen
import app.omnivore.omnivore.feature.profile.filters.FiltersScreen
import app.omnivore.omnivore.feature.save.SaveViewModel
import app.omnivore.omnivore.feature.web.WebViewScreen
import app.omnivore.omnivore.navigation.Routes
import app.omnivore.omnivore.navigation.TopLevelDestination

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
    val navController = rememberNavController()

    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }, bottomBar = {
        if (
            navController.currentBackStackEntryAsState().value?.destination?.route in
            TopLevelDestination.entries.map { it.route }
        ) {
            OmnivoreBottomBar(
                navController,
                TopLevelDestination.entries,
                navController.currentBackStackEntryAsState().value?.destination
            )
        }
    }) { padding ->
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
        ) {
            if (hasAuthToken) {
                PrimaryNavigator(
                    navController = navController,
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
    navController: NavHostController,
    loginViewModel: LoginViewModel,
    searchViewModel: SearchViewModel,
    labelsViewModel: LabelsViewModel,
    saveViewModel: SaveViewModel,
    editInfoViewModel: EditInfoViewModel,
    snackbarHostState: SnackbarHostState
) {

    val slideDistance = rememberSlideDistance()
    val duration = DEFAULT_MOTION_DURATION

    val enterTransition = slideInHorizontally(
        animationSpec = tween(
            durationMillis = duration,
            easing = FastOutSlowInEasing
        ),
        initialOffsetX = {
            slideDistance
        }
    ) + fadeIn(
        animationSpec = tween(
            durationMillis = duration.ForIncoming,
            delayMillis = duration.ForOutgoing,
            easing = LinearOutSlowInEasing
        )
    )

    val exitTransition = slideOutHorizontally(
        animationSpec = tween(
            durationMillis = duration,
            easing = FastOutSlowInEasing
        ),
        targetOffsetX = {
            -slideDistance
        }
    ) + fadeOut(
        animationSpec = tween(
            durationMillis = duration.ForOutgoing,
            delayMillis = 0,
            easing = FastOutLinearInEasing
        )
    )

    NavHost(
        navController = navController, startDestination = Routes.Inbox.route,
        enterTransition = { enterTransition },
        popEnterTransition = { enterTransition },
        exitTransition = { exitTransition },
        popExitTransition = { exitTransition }

    ) {
        composable(Routes.Inbox.route) {
            LibraryView(
                navController = navController,
                labelsViewModel = labelsViewModel,
                saveViewModel = saveViewModel,
                editInfoViewModel = editInfoViewModel,
            )
        }

        composable(Routes.Following.route) {
            FollowingScreen(
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
                loginViewModel = loginViewModel, navController = navController
            )
        }

        composable(Routes.About.route) {
            AboutScreen(
                navController = navController
            )
        }

        composable(Routes.Filters.route) {
            FiltersScreen(
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
                    icon,
                    contentDescription = stringResource(id = screen.iconTextId)
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

private fun NavDestination?.isTopLevelDestinationInHierarchy(destination: TopLevelDestination) =
    this?.hierarchy?.any {
        it.route?.contains(destination.name, true) ?: false
    } ?: false
