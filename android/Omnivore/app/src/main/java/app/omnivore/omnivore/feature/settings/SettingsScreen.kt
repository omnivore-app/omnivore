package app.omnivore.omnivore.feature.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.auth.LoginViewModel
import app.omnivore.omnivore.navigation.Routes

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun SettingsScreen(
    loginViewModel: LoginViewModel,
    navController: NavHostController
) {
    Scaffold(topBar = {
        TopAppBar(
            title = { Text(stringResource(R.string.settings_view_title)) },
            navigationIcon = {
                IconButton(onClick = { navController.navigateUp() }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                        contentDescription = null
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
            navController = navController,
            paddingValues = paddingValues
        )
    }
}

@Composable
fun SettingsViewContent(
    loginViewModel: LoginViewModel,
    navController: NavHostController,
    paddingValues: PaddingValues
) {
    val showLogoutDialog = remember { mutableStateOf(false) }

    val state = rememberLazyListState()

    LazyColumn(
        state = state,
        contentPadding = paddingValues,
    ) {

        item {
            SettingRow(title = stringResource(R.string.settings_view_setting_row_manage_account)) {
                navController.navigate(Routes.Account.route)
            }
        }

        item {
            SettingRow(
                title = stringResource(R.string.settings_view_setting_row_logout)
            ) {
                showLogoutDialog.value = true
            }
        }

        item {
            SettingRow(title = stringResource(R.string.about_view_title)) {
                navController.navigate(Routes.About.route)
            }
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
}


@Composable
internal fun SettingRow(
    title: String, subtitle: String? = null, onClick: (() -> Unit)?
) {
    Row(
        modifier = Modifier
            .clickable(enabled = onClick != null, onClick = { onClick?.invoke() })
            .fillMaxWidth(), verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(vertical = SettingsVerticalPadding)
        ) {
            Text(
                modifier = Modifier.padding(horizontal = SettingsHorizontalPadding),
                text = title,
                overflow = TextOverflow.Ellipsis,
                maxLines = 2,
                style = MaterialTheme.typography.titleLarge,
                fontSize = SettingsTitleFontSize,
            )
            if (!subtitle.isNullOrBlank()) {
                Text(
                    text = subtitle,
                    modifier = Modifier
                        .padding(horizontal = SettingsHorizontalPadding)
                        .alpha(SettingsSecondaryItemAlpha),
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 10,
                )
            }
        }
    }
}

internal val SettingsHorizontalPadding = 16.dp
internal val SettingsVerticalPadding = 16.dp
internal const val SettingsSecondaryItemAlpha = .78f
internal val SettingsTitleFontSize = 16.sp

internal const val RELEASE_URL = "https://github.com/omnivore-app/omnivore/releases"
