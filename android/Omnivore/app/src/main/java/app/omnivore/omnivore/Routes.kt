package app.omnivore.omnivore

sealed class Routes(val route: String) {
    object Library : Routes("Library")
    object WebAppReader : Routes("WebAppReader")
    object Settings: Routes("Settings")
}
