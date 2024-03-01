package app.omnivore.omnivore.feature.library

import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight

enum class SavedItemFilter(val displayText: String, val rawValue: String, val queryString: String) {
    INBOX("Inbox", rawValue = "inbox", "in:inbox"), READ_LATER(
        "Non-Feed Items", "nonFeed", "no:subscription"
    ),
    FEEDS("Feeds", "feeds", "in:inbox label:RSS"), NEWSLETTERS(
        "Newsletters", "newsletters", "in:inbox label:Newsletter"
    ),

    // RECOMMENDED("Recommended", "recommended", "recommendedBy:*"),
    ALL("All", "all", "in:all"), ARCHIVED("Archived", "archived", "in:archive"),

    // HAS_HIGHLIGHTS("Highlighted", "hasHighlights", "has:highlights"),
    FILES("Files", "files", "type:file"),
}

@Composable
fun SavedItemFilterContextMenu(
    isExpanded: Boolean, onDismiss: () -> Unit, actionHandler: (SavedItemFilter) -> Unit
) {
    DropdownMenu(
        expanded = isExpanded, onDismissRequest = onDismiss
    ) {
        // Displaying only a subset of filters until we figure out the Room DB queries (and labels)
//    SavedItemFilter.values().forEach {
        listOf(
            SavedItemFilter.INBOX,
            SavedItemFilter.READ_LATER,
            SavedItemFilter.NEWSLETTERS,
            SavedItemFilter.FEEDS,
            SavedItemFilter.ALL,
            SavedItemFilter.ARCHIVED,
            SavedItemFilter.FILES
        ).forEach {
            DropdownMenuItem(text = { Text(text = it.displayText, fontWeight = FontWeight.Normal) },
                onClick = {
                    actionHandler(it)
                    onDismiss()
                })
        }
    }
}
