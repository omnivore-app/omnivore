package app.omnivore.omnivore.feature.library

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.navigation.TopLevelDestination

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryNavigationBar(
    currentDestination: TopLevelDestination?,
    savedItemViewModel: SavedItemViewModel,
    onSearchClicked: () -> Unit,
    onAddLinkClicked: () -> Unit
) {
    val actionsMenuItem: SavedItemWithLabelsAndHighlights? by savedItemViewModel.actionsMenuItemLiveData.observeAsState(
        null
    )

    var isMenuExpanded by remember { mutableStateOf(false) }

    TopAppBar(
        title = {
            Text(
                if (actionsMenuItem == null) {
                    currentDestination?.titleTextId?.let { stringResource(it) } ?: ""
                } else {
                    stringResource(R.string.library_nav_bar_title_alt)
                }
            )
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = if (actionsMenuItem == null) MaterialTheme.colorScheme.background else MaterialTheme.colorScheme.surfaceVariant
        ),
        navigationIcon = {
            if (actionsMenuItem != null) {
                IconButton(onClick = {
                    savedItemViewModel.actionsMenuItemLiveData.postValue(null)
                }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        modifier = Modifier,
                        contentDescription = "Back"
                    )
                }
            }
        },
        actions = {
            actionsMenuItem?.let {
                IconButton(onClick = {
                    savedItemViewModel.handleSavedItemAction(
                        it.savedItem.savedItemId,
                        if (it.savedItem.isArchived) SavedItemAction.Unarchive else SavedItemAction.Archive
                    )
                }) {
                    if (it.savedItem.isArchived) {
                        Icon(
                            painter = painterResource(id = R.drawable.unarchive),
                            contentDescription = null
                        )
                    } else {
                        Icon(
                            painter = painterResource(id = R.drawable.archive_outline),
                            contentDescription = null
                        )
                    }
                }
                IconButton(onClick = {
                    savedItemViewModel.handleSavedItemAction(
                        it.savedItem.savedItemId,
                        SavedItemAction.EditInfo
                    )
                }) {
                    Icon(
                        Icons.Outlined.Info,
                        contentDescription = null
                    )
                }
                IconButton(onClick = {
                    savedItemViewModel.handleSavedItemAction(
                        it.savedItem.savedItemId,
                        SavedItemAction.EditLabels
                    )
                }) {
                    Icon(
                        painter = painterResource(id = R.drawable.tag),
                        contentDescription = null
                    )
                }
                IconButton(onClick = {
                    savedItemViewModel.handleSavedItemAction(
                        it.savedItem.savedItemId,
                        SavedItemAction.Delete
                    )
                }) {
                    Icon(
                        imageVector = Icons.Outlined.Delete,
                        contentDescription = null
                    )
                }
                IconButton(onClick = { isMenuExpanded = true } ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = null
                    )
                    if (isMenuExpanded) {
                        SavedItemLibraryContextMenu(
                            savedItemViewModel = savedItemViewModel,
                            savedItem = it.savedItem,
                            isExpanded = true,
                            onDismiss = { isMenuExpanded = false },
                        )
                    }
                }
            } ?: run {
                IconButton(onClick = onSearchClicked) {
                    Icon(
                        imageVector = Icons.Filled.Search,
                        contentDescription = null
                    )
                }

                IconButton(onClick = onAddLinkClicked) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = null
                    )
                }
            }
        }
    )
}

@Composable
fun SearchField(
    searchText: String,
    onSearch: () -> Unit,
    onSearchTextChanged: (String) -> Unit,
    navController: NavHostController,
) {
    var showClearButton by remember { mutableStateOf(false) }
    val focusRequester = remember { FocusRequester() }

    TextField(
        modifier = Modifier
            .fillMaxWidth()
            .onFocusChanged { focusState ->
                showClearButton = (focusState.isFocused)
            }
            .focusRequester(focusRequester),
        value = searchText,
        onValueChange = onSearchTextChanged,
        placeholder = {
            Text(text = stringResource(R.string.library_nav_bar_field_placeholder_search))
        },
        leadingIcon = {
            IconButton(
                onClick = {
                    onSearchTextChanged("")
                    navController.popBackStack()
                }) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back"
                )
            }
        },
        trailingIcon = {
            AnimatedVisibility(
                visible = showClearButton,
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                IconButton(onClick = { onSearchTextChanged("") }) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = null
                    )
                }

            }
        },
        maxLines = 1,
        singleLine = true,
        keyboardOptions = KeyboardOptions.Default.copy(imeAction = ImeAction.Search),
        keyboardActions = KeyboardActions(onSearch = {
            onSearch()
        }),
    )

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }
}
