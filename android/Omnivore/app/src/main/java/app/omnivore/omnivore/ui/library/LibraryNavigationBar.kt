package app.omnivore.omnivore.ui.library

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.text.input.ImeAction
import androidx.navigation.NavHostController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryNavigationBar(
  onSearchClicked: () -> Unit,
  onSettingsIconClick: () -> Unit
) {
  TopAppBar(
    title = {
        Text("Library")
    },
      modifier = Modifier.statusBarsPadding(),
//      colors = TopAppBarDefaults.topAppBarColors(
//      // containerColor = MaterialTheme.colorScheme.background,
//      //    scrolledContainerColor = colorResource(R.color.gray_B7B7B7)
//        ),
    actions = {
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
