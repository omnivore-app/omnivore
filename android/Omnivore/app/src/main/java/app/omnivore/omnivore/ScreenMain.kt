package app.omnivore.omnivore

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import app.omnivore.omnivore.screen.EmailLoginPage
import app.omnivore.omnivore.screen.SplashPage

@Composable
fun ScreenMain(viewModel: LoginViewModel){
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Routes.Splash.route) {
        composable(Routes.Splash.route) {
            SplashPage(viewModel = viewModel, navController = navController)
        }
        composable(Routes.EmailLogin.route) {
            EmailLoginPage(viewModel = viewModel, navController = navController)
        }
    }
}
