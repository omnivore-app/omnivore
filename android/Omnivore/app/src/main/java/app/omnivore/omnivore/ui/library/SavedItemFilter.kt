package app.omnivore.omnivore.ui.library

import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

interface ListFilter {
  val rawValue: String
  val displayText: String
  val queryString: String
}

enum class LibraryFilter(override val displayText: String, override val rawValue: String, override val queryString: String): ListFilter {
  INBOX("Inbox", rawValue = "inbox", "in:library"),
  NEWSLETTERS("Newsletters", "newsletters", "in:inbox label:Newsletter"),
  RECOMMENDED("Recommended", "recommended", "recommendedBy:*"),
  ALL("All", "all", "in:all"),
  ARCHIVED("Archived", "archived", "in:archive"),
  HAS_HIGHLIGHTS("Highlighted", "hasHighlights", "has:highlights"),
  FILES("Files", "files", "type:file");
}

enum class SubscriptionFilter(override val displayText: String, override val rawValue: String, override val queryString: String): ListFilter {
  READ_LATER("Subscriptions", "subscriptions", "in:subscriptions"),
  NEWSLETTERS("Newsletters", "newsletters", "in:inbox label:Newsletter"),
  RSS("Newsletters", "newsletters", "in:inbox label:RSS"),
}

@Composable
fun SavedItemFilterContextMenu(
  filters: List<ListFilter>,
  isExpanded: Boolean,
  onDismiss: () -> Unit,
  actionHandler: (ListFilter) -> Unit
) {
  DropdownMenu(
    expanded = isExpanded,
    onDismissRequest = onDismiss
  ) {
    filters.forEach {
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
