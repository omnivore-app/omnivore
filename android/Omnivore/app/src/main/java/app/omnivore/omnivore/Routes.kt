package app.omnivore.omnivore

sealed class Routes(val route: String) {
    object Library : Routes("Library")
    object Settings: Routes("Settings")
}
