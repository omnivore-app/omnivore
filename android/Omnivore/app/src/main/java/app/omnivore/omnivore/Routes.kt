package app.omnivore.omnivore

sealed class Routes(val route: String) {
    object Splash : Routes("Splash")
    object EmailLogin : Routes("EmailLogin")
}
