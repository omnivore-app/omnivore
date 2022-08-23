package app.omnivore.omnivore.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import app.omnivore.omnivore.ui.auth.LoginViewModel

@Composable
fun HomeView(viewModel: LoginViewModel) {
  Column(
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier
      .background(MaterialTheme.colorScheme.background)
      .fillMaxSize()
  ) {
    Text("You have a valid auth token. Nice. Go save something in Chrome!")

    Button(onClick = {
      viewModel.logout()
    }) {
      Text(text = "Logout")
    }
  }
}
