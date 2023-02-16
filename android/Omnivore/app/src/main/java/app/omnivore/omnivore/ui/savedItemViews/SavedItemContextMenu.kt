package app.omnivore.omnivore.ui.savedItemViews

import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import app.omnivore.omnivore.ui.library.SavedItemFilter

@Composable
fun SavedItemContextMenu(
  isExpanded: Boolean,
  onDismiss: () -> Unit,
  actionHandler: (SavedItemFilter) -> Unit
) {
  DropdownMenu(
    expanded = isExpanded,
    onDismissRequest = onDismiss
  ) {
    DropdownMenuItem(
      text = { Text("One") },
      onClick = {
        actionHandler(SavedItemFilter.INBOX)
        onDismiss()
      }
    )
    DropdownMenuItem(
      text = { Text("Two") },
      onClick = {
        actionHandler(SavedItemFilter.INBOX)
        onDismiss()
      }
    )
  }
}
