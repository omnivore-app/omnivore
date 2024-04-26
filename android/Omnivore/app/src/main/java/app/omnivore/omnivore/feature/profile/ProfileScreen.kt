package app.omnivore.omnivore.feature.profile

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.component.TextPreferenceWidget
import app.omnivore.omnivore.feature.auth.LoginViewModel
import app.omnivore.omnivore.navigation.Routes

internal const val RELEASE_URL = "https://github.com/omnivore-app/omnivore/releases"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun SettingsScreen(
    navController: NavHostController,
    loginViewModel: LoginViewModel = hiltViewModel()
) {
    Scaffold(topBar = {
        TopAppBar(
            title = { Text(stringResource(R.string.profile_view_title)) },
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
            TextPreferenceWidget(
                title = stringResource(R.string.profile_filters),
                onPreferenceClick = { navController.navigate(Routes.Filters.route) },
            )
        }

        item { HorizontalDivider() }

        item {
            TextPreferenceWidget(
                title = stringResource(R.string.profile_manage_account),
                onPreferenceClick = { navController.navigate(Routes.Account.route) },
            )
        }

        item {
            TextPreferenceWidget(
                title = stringResource(R.string.about_logout),
                onPreferenceClick = { showLogoutDialog.value = true },
            )
        }

        item {
            TextPreferenceWidget(
                title = stringResource(R.string.about_view_title),
                onPreferenceClick = { navController.navigate(Routes.About.route) },
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
}

