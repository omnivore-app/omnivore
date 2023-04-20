package app.omnivore.omnivore.ui.library

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.ImeAction
import androidx.lifecycle.MutableLiveData
import androidx.navigation.NavHostController
import app.omnivore.omnivore.R
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.persistence.entities.SavedItemCardDataWithLabels

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryNavigationBar(
  savedItemViewModel: SavedItemViewModel,
  onSearchClicked: () -> Unit,
  onSettingsIconClick: () -> Unit
) {
    val actionsMenuItem: SavedItemCardData? by savedItemViewModel.actionsMenuItemLiveData.observeAsState(null)

  TopAppBar(
    title = {
        Text(if (actionsMenuItem == null) "Library" else "")
    },
      modifier = Modifier.statusBarsPadding(),
      colors = TopAppBarDefaults.topAppBarColors(
          containerColor = if (actionsMenuItem == null)  MaterialTheme.colorScheme.background else MaterialTheme.colorScheme.surfaceVariant
        ),
      navigationIcon = {
          if (actionsMenuItem != null) {
              IconButton(onClick = {
                  savedItemViewModel.actionsMenuItemLiveData.postValue(null)
              }) {
                  Icon(
                      imageVector = androidx.compose.material.icons.Icons.Filled.ArrowBack,
                      modifier = Modifier,
                      contentDescription = "Back"
                  )
              }
          }
      },
    actions = {
        if (actionsMenuItem != null) {
            IconButton(onClick = onSearchClicked) {
                Icon(
                    painter = painterResource(id = R.drawable.archive_outline),
                    contentDescription = null
                )
            }
            IconButton(onClick = onSearchClicked) {
                Icon(
                    painter = painterResource(id = R.drawable.tag),
                    contentDescription = null
                )
            }
            IconButton(onClick = onSearchClicked) {
                Icon(
                    imageVector = Icons.Outlined.Delete,
                    contentDescription = null
                )
            }
            IconButton(onClick = onSettingsIconClick) {
                Icon(
                    imageVector = Icons.Default.MoreVert,
                    contentDescription = null
                )
            }
        } else {
            IconButton(onClick = onSearchClicked) {
                Icon(
                    imageVector = Icons.Filled.Search,
                    contentDescription = null
                )
            }

            IconButton(onClick = onSettingsIconClick) {
                Icon(
                    imageVector = Icons.Default.MoreVert,
                    contentDescription = null
                )
            }
        }
    }
  )
}


@OptIn(ExperimentalComposeUiApi::class, ExperimentalMaterial3Api::class)
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
          Text(text = "Search")
        },
        leadingIcon = {
            IconButton(
                onClick = {
                    onSearchTextChanged("")
                    navController.popBackStack()
                }) {
                    Icon(
                        imageVector = androidx.compose.material.icons.Icons.Filled.ArrowBack,
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
