package app.omnivore.omnivore.feature.profile.about

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Public
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import app.omnivore.omnivore.BuildConfig
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.designsystem.component.TextPreferenceWidget
import app.omnivore.omnivore.core.ui.LinkIcon
import app.omnivore.omnivore.feature.profile.ProfileViewModel
import app.omnivore.omnivore.feature.profile.RELEASE_URL
import app.omnivore.omnivore.navigation.Routes

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun AboutScreen(
    navController: NavHostController,
    settingsViewModel: ProfileViewModel = hiltViewModel()
) {

    val uriHandler = LocalUriHandler.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.about_view_title)) },
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
                LogoHeader()
            }

            item {
                TextPreferenceWidget(
                    title = stringResource(R.string.about_view_row_whats_new),
                    onPreferenceClick = { uriHandler.openUri(RELEASE_URL) },
                )
            }

            item {
                TextPreferenceWidget(
                    title = stringResource(R.string.about_documentation),
                    onPreferenceClick = { navController.navigate(Routes.Documentation.route) },
                )
            }

            item {
                TextPreferenceWidget(
                    title = stringResource(R.string.about_feedback),
                    onPreferenceClick = { settingsViewModel.presentIntercom() },
                )
            }

            item {
                TextPreferenceWidget(
                    title = stringResource(R.string.about_privacy_policy),
                    onPreferenceClick = { navController.navigate(Routes.PrivacyPolicy.route) },
                )
            }

            item {
                TextPreferenceWidget(
                    title = stringResource(R.string.about_terms_and_conditions),
                    onPreferenceClick = { navController.navigate(Routes.TermsAndConditions.route) },
                )
            }

            item {
                TextPreferenceWidget(
                    title = stringResource(R.string.about_view_row_version),
                    subtitle = getVersionName(),
                    onPreferenceClick = {  },
                )
            }

            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.Center,
                ) {
                    LinkIcon(
                        label = stringResource(R.string.website),
                        icon = Icons.Outlined.Public,
                        url = "https://omnivore.app",
                    )
                    LinkIcon(
                        label = "Discord",
                        icon = ImageVector.vectorResource(R.drawable.ic_discord),
                        url = "https://discord.gg/h2z5rppzz9",
                    )
                    LinkIcon(
                        label = "X",
                        icon = ImageVector.vectorResource(R.drawable.ic_x),
                        url = "https://x.com/omnivoreapp",
                    )
                    LinkIcon(
                        label = "GitHub",
                        icon = ImageVector.vectorResource(R.drawable.ic_github),
                        url = "https://github.com/omnivore-app",
                    )
                }
            }
        }
    }
}

fun getVersionName(): String {
    return when {
        BuildConfig.DEBUG -> {
            "Debug ${BuildConfig.VERSION_NAME}"
        }
        else -> {
            "Stable ${BuildConfig.VERSION_NAME}"
        }
    }
}
