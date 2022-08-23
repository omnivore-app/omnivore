package app.omnivore.omnivore

sealed class Routes(val route: String) {
    object Root : Routes("Root")
    object Home : Routes("Home")
    object Welcome : Routes("Welcome")
}
