package app.omnivore.omnivore

sealed class Routes(val route: String) {
    object Home : Routes("Home")
    object WebAppReader : Routes("WebAppReader")
    object Settings: Routes("Settings")
}
