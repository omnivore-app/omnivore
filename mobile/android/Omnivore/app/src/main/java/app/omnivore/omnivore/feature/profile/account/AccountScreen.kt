package app.omnivore.omnivore.feature.profile.account

import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.component.TextPreferenceWidget
import app.omnivore.omnivore.feature.profile.ProfileViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun AccountScreen(
    navController: NavHostController,
    snackbarHostState: SnackbarHostState,
    settingsViewModel: ProfileViewModel = hiltViewModel()
) {
    LaunchedEffect(settingsViewModel.isResettingData) {
        if (settingsViewModel.isResettingData) {
            val result = snackbarHostState.showSnackbar(
                message = settingsViewModel.snackbarMessage,
                duration = SnackbarDuration.Indefinite,
            )
            when (result) {
                SnackbarResult.Dismissed -> {
                    settingsViewModel.isResettingData = false
                }
                SnackbarResult.ActionPerformed -> { }
            }
        } else if (settingsViewModel.isDataResetCompleted) {
            snackbarHostState.showSnackbar(
                message = "Data reset completed.",
                duration = SnackbarDuration.Short
            )
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.manage_account_title)) },
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
        },
    ) { contentPadding ->
        LazyColumn(
            contentPadding = contentPadding,
        ) {
            item {
                TextPreferenceWidget(
                    title = stringResource(R.string.manage_account_action_reset_data_cache),
                    onPreferenceClick = { settingsViewModel.resetDataCache() },
                )
            }
        }
    }
}
