package app.omnivore.omnivore.navigation

sealed class Routes(val route: String) {
    data object Home : Routes("Home")
    data object Welcome : Routes("Welcome")
    data object EmailSignIn : Routes("EmailSignIn")
    data object EmailSignUp : Routes("EmailSignUp")
    data object EmailConfirmation : Routes("EmailConfirmation")
    data object SelfHosting : Routes("SelfHosting")
    data object CreateUser : Routes("CreateUser")
    data object AuthProvider : Routes("AuthProvider")
    data object Following : Routes("Following")
    data object Inbox : Routes("Inbox")
    data object Settings : Routes("Settings")
    data object About : Routes("About")
    data object Filters : Routes("Filters")
    data object Account : Routes("Account")
    data object Search : Routes("Search")
    data object Documentation : Routes("Documentation")
    data object PrivacyPolicy : Routes("PrivacyPolicy")
    data object TermsAndConditions : Routes("TermsAndConditions")
    data object Notebook : Routes("Notebook")
}
