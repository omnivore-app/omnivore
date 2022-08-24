package app.omnivore.omnivore.ui.root

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.auth.WelcomeScreen
import app.omnivore.omnivore.ui.home.HomeView

@Composable
fun RootView(viewModel: LoginViewModel) {
    val hasAuthToken: Boolean by viewModel.hasAuthTokenLiveData.observeAsState(false)

    if (hasAuthToken) {
        HomeView(viewModel = viewModel)
    } else {
        WelcomeScreen(viewModel = viewModel)
    }
}
