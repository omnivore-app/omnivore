package app.omnivore.omnivore.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.ui.auth.LoginViewModel
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions

@Composable
fun HomeView(viewModel: LoginViewModel) {
  val context = LocalContext.current

  Column(
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally,
    modifier = Modifier
      .background(MaterialTheme.colorScheme.background)
      .fillMaxSize()
      .padding(horizontal = 6.dp)
  ) {
    Text("You have a valid auth token. Nice. Go save something in Chrome!")

    Button(onClick = {
      // Sign out google users
      val signInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .build()

      val googleSignIn = GoogleSignIn.getClient(context, signInOptions)
      googleSignIn.signOut()

      viewModel.logout()
    }) {
      Text(text = "Logout")
    }
  }
}
