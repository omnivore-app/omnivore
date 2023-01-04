package app.omnivore.omnivore.ui.linkedItemViews

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.List
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import app.omnivore.omnivore.ui.library.LinkedItemAction

@Composable
fun LinkedItemContextMenu(
  isExpanded: Boolean,
  isArchived: Boolean,
  onDismiss: () -> Unit,
  actionHandler: (LinkedItemAction) -> Unit
) {
  DropdownMenu(
    expanded = isExpanded,
    onDismissRequest = onDismiss
  ) {
    DropdownMenuItem(
      text = { Text(if (isArchived) "Unarchive" else "Archive") },
      onClick = {
        val action = if (isArchived) LinkedItemAction.Unarchive else LinkedItemAction.Archive
        actionHandler(action)
        onDismiss()
      },
      leadingIcon = {
        Icon(
          Icons.Outlined.List, // TODO: use more appropriate icon
          contentDescription = null
        )
      }
    )
    DropdownMenuItem(
      text = { Text("Remove Item") },
      onClick = {
        actionHandler(LinkedItemAction.Delete)
        onDismiss()
      },
      leadingIcon = {
        Icon(
          Icons.Outlined.Delete,
          contentDescription = null
        )
      }
    )
  }
}
