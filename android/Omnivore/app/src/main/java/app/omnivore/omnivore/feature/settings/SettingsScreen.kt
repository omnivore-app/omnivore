package app.omnivore.omnivore.feature.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.BuildConfig
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.auth.LoginViewModel
import app.omnivore.omnivore.navigation.Routes

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun SettingsScreen(
    loginViewModel: LoginViewModel,
    settingsViewModel: SettingsViewModel,
    navController: NavHostController,
) {
    Scaffold(topBar = {
        TopAppBar(
            title = { Text(stringResource(R.string.settings_view_title)) },
            navigationIcon = {
                IconButton(onClick = { navController.navigateUp() }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = null
                    )
                }

            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.background
            ),
        )
    }) { paddingValues ->
        SettingsViewContent(
            loginViewModel = loginViewModel,
            settingsViewModel = settingsViewModel,
            navController = navController,
            paddingValues = paddingValues
        )
    }
}

@Composable
fun SettingsViewContent(
    loginViewModel: LoginViewModel,
    settingsViewModel: SettingsViewModel,
    navController: NavHostController,
    paddingValues: PaddingValues
) {
    val showLogoutDialog = remember { mutableStateOf(false) }
    val showManageAccountDialog = remember { mutableStateOf(false) }

    val state = rememberLazyListState()
        val version = "Omnivore Version: " + BuildConfig.VERSION_NAME

        LazyColumn(
            state = state,
            contentPadding = paddingValues,
        ) {

            item {
                SettingRow(text = stringResource(R.string.settings_view_setting_row_documentation)) {
                    navController.navigate(Routes.Documentation.route)
                }
            }

            item {
                SettingRow(text = stringResource(R.string.settings_view_setting_row_feedback)) {
                    settingsViewModel.presentIntercom()
                }
            }

            item {
                SettingRow(text = stringResource(R.string.settings_view_setting_row_privacy_policy)) {
                    navController.navigate(Routes.PrivacyPolicy.route)
                }
            }

            item {
                SettingRow(text = stringResource(R.string.settings_view_setting_row_terms_and_conditions)) {
                    navController.navigate(Routes.TermsAndConditions.route)
                }
            }

            item { HorizontalDivider() }

            item {
                SettingRow(text = stringResource(R.string.settings_view_setting_row_manage_account)) {
                    showManageAccountDialog.value = true
                }
            }

            item {
                SettingRow(
                    text = stringResource(R.string.settings_view_setting_row_logout)
                ) {
                    showLogoutDialog.value = true
                }
            }

            item {
                Text(
                    text = version, fontSize = 12.sp, modifier = Modifier.padding(15.dp)
                )
            }
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


@Composable
private fun SettingRow(text: String, tapAction: () -> Unit) {
    Row(horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { tapAction() }) {
        Text(
            text = text,
            modifier = Modifier
                .align(Alignment.CenterVertically)
                .padding(16.dp)
        )
    }
}
