package app.omnivore.omnivore.ui.root

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.auth.WelcomeScreen
import app.omnivore.omnivore.ui.home.HomeView
import app.omnivore.omnivore.ui.home.HomeViewModel

@Composable
fun RootView(loginViewModel: LoginViewModel, homeViewModel: HomeViewModel) {
  val hasAuthToken: Boolean by loginViewModel.hasAuthTokenLiveData.observeAsState(false)

  if (hasAuthToken) {
    HomeView(
      loginViewModel = loginViewModel,
      homeViewModel = homeViewModel
    )
  } else {
    WelcomeScreen(viewModel = loginViewModel)
  }
}
