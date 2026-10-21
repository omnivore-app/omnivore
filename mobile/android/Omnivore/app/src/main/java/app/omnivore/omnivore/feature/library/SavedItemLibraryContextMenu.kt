package app.omnivore.omnivore.feature.library

import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights

@Composable
fun SavedItemLibraryContextMenu(
    savedItemViewModel: SavedItemViewModel,
    savedItem: SavedItem,
    isExpanded: Boolean,
    onDismiss: () -> Unit,
) {
    val menuOptions = listOf(
        if (savedItemViewModel.actionsMenuItemLiveData.value?.savedItem?.readingProgress == 100.0) {
            MenuItemOption(R.string.saved_item_context_menu_action_mark_unread, SavedItemAction.MarkUnread)
        } else {
            MenuItemOption(R.string.saved_item_context_menu_action_mark_read, SavedItemAction.MarkRead)
        }
    )

    DropdownMenu(
        expanded = isExpanded,
        onDismissRequest = onDismiss
    ) {
        menuOptions.forEach { option ->
            DropdownMenuItem(
                text = { Text( text = stringResource(option.textResourceId), fontWeight = FontWeight.Normal) },
                onClick = {
                    savedItemViewModel.handleSavedItemAction(savedItem.savedItemId, option.action)
                    onDismiss()
                }
            )
        }
    }
}

data class MenuItemOption(
    val textResourceId: Int,
    val action: SavedItemAction,
    val customAction: (() -> Unit)? = null
)
