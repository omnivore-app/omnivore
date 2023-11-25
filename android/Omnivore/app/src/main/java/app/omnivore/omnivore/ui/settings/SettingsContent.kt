import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.networking.Networker
import app.omnivore.omnivore.networking.viewer
import app.omnivore.omnivore.ui.auth.LoginViewModel
import app.omnivore.omnivore.ui.settings.LogoutDialog
import app.omnivore.omnivore.ui.settings.ManageAccountDialog
import app.omnivore.omnivore.ui.settings.SettingsViewModel
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.IntercomSpace
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsView(
  loginViewModel: LoginViewModel,
  settingsViewModel: SettingsViewModel,
  navController: NavHostController,
) {
  Scaffold(
    topBar = {
      TopAppBar(
        title = { Text(stringResource(R.string.settings_view_title)) },
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
      settingsViewModel = settingsViewModel,
      navController = navController,
      modifier = Modifier
        .padding(
          top = paddingValues.calculateTopPadding(),
          bottom = paddingValues.calculateBottomPadding()
        )
    )
  }
}

@Composable
fun SettingsViewContent(loginViewModel: LoginViewModel, settingsViewModel: SettingsViewModel, navController: NavHostController, modifier: Modifier) {
  val showLogoutDialog = remember { mutableStateOf(false)  }
  val showManageAccountDialog = remember { mutableStateOf(false ) }

  Box(
    modifier = modifier.fillMaxSize()
  ) {
    Column(
      verticalArrangement = Arrangement.Top,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier
        .background(MaterialTheme.colorScheme.background)
        .fillMaxSize()
        .padding(horizontal = 6.dp)
        .verticalScroll(rememberScrollState())
    ) {

      // profile pic and name

//      SettingRow(text = "Labels") { Log.d("settings", "labels button tapped") }
//      RowDivider()
//      SettingRow(text = "Emails") { Log.d("settings", "emails button tapped") }
//      RowDivider()
//      SettingRow(text = "Subscriptions") { Log.d("settings", "subscriptions button tapped") }
//      RowDivider()
//      SettingRow(text = "Clubs") { Log.d("settings", "clubs button tapped") }

//      SectionSpacer()

//      SettingRow(text = "Push Notifications") { Log.d("settings", "pn button tapped") }
//      RowDivider()
//      SettingRow(text = "Text to Speech") { Log.d("settings", "tts button tapped") }
//
//      SectionSpacer()

      SettingRow(text = stringResource(R.string.settings_view_setting_row_documentation)) {
        navController.navigate(Routes.Documentation.route)
      }
      RowDivider()
      SettingRow(text = stringResource(R.string.settings_view_setting_row_feedback)) {
        settingsViewModel.presentIntercom()
      }
      RowDivider()
      SettingRow(text = stringResource(R.string.settings_view_setting_row_privacy_policy)) {
        navController.navigate(Routes.PrivacyPolicy.route)
      }
      RowDivider()
      SettingRow(text = stringResource(R.string.settings_view_setting_row_terms_and_conditions)) {
        navController.navigate(Routes.TermsAndConditions.route)
      }

      SectionSpacer()

      SettingRow(text = stringResource(R.string.settings_view_setting_row_manage_account)) {
        showManageAccountDialog.value = true
      }
      RowDivider()
      SettingRow(text = stringResource(R.string.settings_view_setting_row_logout), includeIcon = false) {
        showLogoutDialog.value = true
      }
      RowDivider()
    }

    if (showLogoutDialog.value) {
      LogoutDialog { performLogout ->
        if (performLogout) {
          loginViewModel.logout()
        }
        showLogoutDialog.value = false
      }
    }

    if (showManageAccountDialog.value) {
      ManageAccountDialog(
        onDismiss = { showManageAccountDialog.value = false },
        settingsViewModel = settingsViewModel
      )
    }
  }
}

@Composable
private fun RowDivider() {
  Divider(
    modifier = Modifier.padding(horizontal = 12.dp),
    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f)
  )
}

@Composable
private fun SectionSpacer() {
  RowDivider()
  Spacer(Modifier.height(60.dp))
  RowDivider()
}

@Composable
private fun SettingRow(text: String, includeIcon: Boolean = true, tapAction: () -> Unit) {
  Row(
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically,
    modifier = Modifier
      .fillMaxWidth()
      .clickable { tapAction() }
  ) {
    Text(
      text = text,
      modifier = Modifier
        .align(Alignment.CenterVertically)
        .padding(16.dp),
      style = MaterialTheme.typography.titleMedium
    )

    if (includeIcon) {
      Icon(
        painter = painterResource(id = R.drawable.chevron_right),
        contentDescription = null
      )
    }
  }
}
