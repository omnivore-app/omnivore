package app.omnivore.omnivore.ui.library

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchBar(
  libraryViewModel: LibraryViewModel,
  onSearchClicked: () -> Unit,
  onSettingsIconClick: () -> Unit
) {
  val searchText: String by libraryViewModel.searchTextLiveData.observeAsState("")

  TopAppBar(
    title = {
      if (libraryViewModel.showSearchField) {
        SearchField(searchText) { libraryViewModel.updateSearchText(it) }
      } else {
        Text("Library")
      }
    },
    colors = TopAppBarDefaults.topAppBarColors(
      containerColor = MaterialTheme.colorScheme.surfaceVariant
    ),
    actions = {
      if (libraryViewModel.showSearchField) {
        Text(
          text = "Cancel",
          modifier = Modifier
            .clickable {
              libraryViewModel.updateSearchText("")
              libraryViewModel.showSearchField = false
            }
            .padding(horizontal = 6.dp)
        )
      } else {
        IconButton(onClick = onSearchClicked) {
          Icon(
            imageVector = Icons.Filled.Search,
            contentDescription = null
          )
        }

        IconButton(onClick = onSettingsIconClick) {
          Icon(
            imageVector = Icons.Default.Settings,
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
  onSearchTextChanged: (String) -> Unit
) {
  var showClearButton by remember { mutableStateOf(false) }
  val keyboardController = LocalSoftwareKeyboardController.current
  val focusRequester = remember { FocusRequester() }

 TextField(
        modifier = Modifier
          .fillMaxWidth()
          .padding(vertical = 2.dp)
          .onFocusChanged { focusState ->
            showClearButton = (focusState.isFocused)
          }
          .focusRequester(focusRequester),
        value = searchText,
        onValueChange = onSearchTextChanged,
        placeholder = {
          Text(text = "Search")
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
        keyboardOptions = KeyboardOptions.Default.copy(imeAction = ImeAction.Done),
        keyboardActions = KeyboardActions(onDone = {
          keyboardController?.hide()
        }),
      )

  LaunchedEffect(Unit) {
    focusRequester.requestFocus()
  }
}
