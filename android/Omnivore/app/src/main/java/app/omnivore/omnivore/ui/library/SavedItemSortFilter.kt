package app.omnivore.omnivore.ui.library

import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

enum class SavedItemSortFilter(val displayText: String, val rawValue: String, val queryString: String) {
  NEWEST("Newest", rawValue = "newest", "sort:saved"),
  OLDEST("Oldest", rawValue = "oldest", "sort:saved-ASC"),
  RECENTLY_READ("Recently Read", rawValue = "recentlyRead", "sort:read"),
  RECENTLY_PUBLISHED("Recently Published", rawValue = "recentlyPublished", "sort:published"),
}

@Composable
fun SavedItemSortFilterContextMenu(
  isExpanded: Boolean,
  onDismiss: () -> Unit,
  actionHandler: (SavedItemSortFilter) -> Unit
) {
  DropdownMenu(
    expanded = isExpanded,
    onDismissRequest = onDismiss
  ) {
    SavedItemSortFilter.values().forEach {
      DropdownMenuItem(
        text = { Text(it.displayText) },
        onClick = {
          actionHandler(it)
          onDismiss()
        }
      )
    }
  }
}
