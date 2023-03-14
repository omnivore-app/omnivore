import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.library.LibraryViewContent
import app.omnivore.omnivore.ui.library.LibraryViewModel
import app.omnivore.omnivore.ui.library.SearchBar
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.IntercomSpace

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsView(
  loginViewModel: LoginViewModel,
  navController: NavHostController,
) {
  Scaffold(
    topBar = {
      TopAppBar(
        title = { Text("Settings") },
        actions = {
          IconButton(onClick = { navController.navigate(Routes.Library.route) }) {
            Icon(
              imageVector = Icons.Default.Home,
              contentDescription = null
            )
          }
        }, colors = TopAppBarDefaults.topAppBarColors(
          containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
      )
    }
  ) { paddingValues ->
    SettingsViewContent(
      loginViewModel = loginViewModel,
      modifier = Modifier
        .padding(
          top = paddingValues.calculateTopPadding(),
          bottom = paddingValues.calculateBottomPadding()
        )
    )
  }
}

@Composable
fun SettingsViewContent(loginViewModel: LoginViewModel, modifier: Modifier) {
  val listState = rememberLazyListState()

  Box(
    modifier = modifier.fillMaxSize()
  ) {
    LazyColumn(
      state = listState,
      verticalArrangement = Arrangement.Top,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier
        .background(MaterialTheme.colorScheme.background)
        .fillMaxSize()
        .padding(horizontal = 6.dp)
    ) {
      item {
        LogoutButton { loginViewModel.logout() }
      }

      item {
        Button(onClick = {
          Intercom.client().present(space = IntercomSpace.Messages)
        }) {
          Text(text = "Open Help Center")
        }
      }
    }
  }
}

@Composable
fun LogoutButton(actionHandler: () -> Unit) {
  val context = LocalContext.current

  Button(onClick = {
    // Sign out google users
    val signInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
      .build()

    val googleSignIn = GoogleSignIn.getClient(context, signInOptions)
    googleSignIn.signOut()

    actionHandler()
  }) {
    Text(text = "Logout")
  }
}
