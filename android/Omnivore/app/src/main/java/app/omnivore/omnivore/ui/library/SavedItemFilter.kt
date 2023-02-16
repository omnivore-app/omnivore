package app.omnivore.omnivore.ui.library

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.List
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

enum class SavedItemFilter(val displayText: String, val rawValue: String, val queryString: String) {
  INBOX("Inbox", rawValue = "inbox", "in:inbox"),
  READ_LATER("Read Later", "readlater", "in:inbox -label:Newsletter"),
  NEWSLETTERS("Newsletters", "newsletters", "in:inbox label:Newsletter"),
  RECOMMENDED("Recommended", "recommended", "recommendedBy:*"),
  ALL("All", "all", "in:all"),
  ARCHIVED("Archived", "archived", "in:archive"),
  HAS_HIGHLIGHTS("Highlighted", "hasHighlights", "has:highlights"),
  FILES("Files", "files", "type:file"),
}

@Composable
fun SavedItemFilterContextMenu(
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
