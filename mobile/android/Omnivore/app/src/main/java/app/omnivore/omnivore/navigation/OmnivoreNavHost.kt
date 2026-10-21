package app.omnivore.omnivore.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import app.omnivore.omnivore.core.designsystem.motion.materialSharedAxisXIn
import app.omnivore.omnivore.core.designsystem.motion.materialSharedAxisXOut

private const val INITIAL_OFFSET_FACTOR = 0.10f

@Composable
fun OmnivoreNavHost(
    navController: NavHostController,
    startDestination: String,
    builder: NavGraphBuilder.() -> Unit
) {
    return NavHost(
        navController = navController,
        startDestination = startDestination,
        enterTransition = { materialSharedAxisXIn(initialOffsetX = { (it * INITIAL_OFFSET_FACTOR).toInt() }) },
        exitTransition = { materialSharedAxisXOut(targetOffsetX = { -(it * INITIAL_OFFSET_FACTOR).toInt() }) },
        popEnterTransition = { materialSharedAxisXIn(initialOffsetX = { -(it * INITIAL_OFFSET_FACTOR).toInt() }) },
        popExitTransition = { materialSharedAxisXOut(targetOffsetX = { (it * INITIAL_OFFSET_FACTOR).toInt() }) }
    ) {
        builder()
    }
}
