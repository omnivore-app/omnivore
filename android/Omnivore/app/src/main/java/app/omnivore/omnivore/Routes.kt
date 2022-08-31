package app.omnivore.omnivore

sealed class Routes(val route: String) {
    object Home : Routes("Home")
    object WebReader : Routes("WebReader")
    object Settings: Routes("Settings")
}
