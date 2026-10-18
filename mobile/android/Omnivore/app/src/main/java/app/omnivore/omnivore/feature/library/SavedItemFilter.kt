package app.omnivore.omnivore.feature.library

import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight

enum class SavedItemFilter(val displayText: String, val rawValue: String, val queryString: String) {
    FOLLOWING("Following", "following", "in:following use:folders"),
    INBOX("Inbox", rawValue = "inbox", "in:inbox use:folders"),
    NON_FEED("Non-Feed Items", "nonFeed", "no:subscription"),
    FEEDS("Feeds", "feeds", "in:inbox label:RSS"),
    NEWSLETTERS("Newsletters", "newsletters", "in:inbox label:Newsletter"),
    ALL("All", "all", "in:all"),
    ARCHIVED("Archived", "archived", "in:archive"),
    FILES("Files", "files", "type:file"),
}

@Composable
fun SavedItemFilterContextMenu(
    isFollowingScreen: Boolean,
    isExpanded: Boolean, onDismiss: () -> Unit,
    actionHandler: (SavedItemFilter) -> Unit
) {

    val filters = if (isFollowingScreen) {
        listOf(
            SavedItemFilter.FOLLOWING,
            SavedItemFilter.FEEDS,
            SavedItemFilter.NEWSLETTERS
        )
    } else {
        listOf(
            SavedItemFilter.INBOX,
            SavedItemFilter.NON_FEED,
            SavedItemFilter.ALL,
            SavedItemFilter.ARCHIVED,
            SavedItemFilter.FILES
        )
    }
    DropdownMenu(
        expanded = isExpanded, onDismissRequest = onDismiss
    ) {
        // Displaying only a subset of filters until we figure out the Room DB queries (and labels)
//    SavedItemFilter.values().forEach {
        filters.forEach {
            DropdownMenuItem(text = { Text(text = it.displayText, fontWeight = FontWeight.Normal) },
                onClick = {
                    actionHandler(it)
                    onDismiss()
                })
        }
    }
}
