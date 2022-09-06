package app.omnivore.omnivore.ui.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.LocalContentAlpha
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp

@Composable
fun SearchBar(
  searchText: String,
  onSearchTextChanged: (String) -> Unit,
  onSettingsIconClick: () -> Unit
) {
  var showSearchField by remember { mutableStateOf(false) }
  TopAppBar(
    title = {
      if (showSearchField) {
        SearchField(searchText, onSearchTextChanged)
      } else {
        Text("Home")
      }
    },
    backgroundColor = MaterialTheme.colorScheme.surfaceVariant,
    actions = {
      if (showSearchField) {
        Text(
          text = "Cancel",
          modifier = Modifier
            .clickable { showSearchField = false }
        )
      } else {
        IconButton(onClick = { showSearchField = true }) {
          Icon(
            imageVector = Icons.Filled.Search,
            contentDescription = null
          )
        }

        IconButton(onClick = onSettingsIconClick) {
          Icon(
            imageVector = Icons.Filled.Settings,
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

  Row {
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
  }


  LaunchedEffect(Unit) {
    focusRequester.requestFocus()
  }
}
