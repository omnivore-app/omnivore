package app.omnivore.omnivore.feature.profile.discover_settings

import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.runtime.getValue
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.component.SwitchPreferenceWidget

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun DiscoverSettingsScreen(
    navController: NavHostController,
    discoverSettingsViewModel: DiscoverSettingsViewModel = hiltViewModel()
) {

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.profile_discover)) },
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
                val discoverTabActive by discoverSettingsViewModel.discoverTabActiveState.collectAsStateWithLifecycle()

                SwitchPreferenceWidget(
                    title = stringResource(R.string.hide_discover_tab),
                    checked = !discoverTabActive,
                    onCheckedChanged = { discoverSettingsViewModel.setDiscoverTabActiveState(!it) },
                )
            }

            item {
                val discoverTopicsActive by discoverSettingsViewModel.discoverTopicsActiveState.collectAsStateWithLifecycle()

                SwitchPreferenceWidget(
                    title = stringResource(R.string.hide_discover_topics),
                    checked = !discoverTopicsActive,
                    onCheckedChanged = { discoverSettingsViewModel.setDiscoverTopicsActiveState(!it) },
                )
            }
        }
    }
}
