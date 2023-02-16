package app.omnivore.omnivore.ui.library

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryFilterBar(viewModel: LibraryViewModel) {
  var isSavedItemFilterMenuExpanded by remember { mutableStateOf(false) }
  Column {
    Row(
      horizontalArrangement = Arrangement.Start,
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier
        .fillMaxWidth()
    ) {
      AssistChip(
        onClick = { isSavedItemFilterMenuExpanded = true },
        label = { Text("Inbox") },
        trailingIcon = {
          Icon(
            Icons.Default.ArrowDropDown,
            contentDescription = "drop down button to change primary library filter"
          )
        },
        modifier = Modifier.padding(end = 6.dp)
      )
      AssistChip(
        onClick = { /* Do something! */ },
        label = { Text("Newest") },
        trailingIcon = {
          Icon(
            Icons.Default.ArrowDropDown,
            contentDescription = "drop down button to change library sort order"
          )
        },
        modifier = Modifier.padding(end = 6.dp)
      )
    }

    SavedItemFilterContextMenu(
      isExpanded = isSavedItemFilterMenuExpanded,
      onDismiss = { isSavedItemFilterMenuExpanded = false },
      actionHandler = { it -> Log.d("ss", "$it")}
    )
  }
}
