package app.omnivore.omnivore.feature.savedItemViews

import android.content.Context
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import app.omnivore.omnivore.R
import app.omnivore.omnivore.feature.library.SavedItemAction
import app.omnivore.omnivore.feature.reader.WebReaderViewModel

@Composable
fun SavedItemContextMenu(
    isExpanded: Boolean,
    isArchived: Boolean,
    context: Context,
    webReaderViewModel: WebReaderViewModel,
    onDismiss: () -> Unit,
    actionHandler: (SavedItemAction) -> Unit
) {
    val menuOptions = listOf(
        MenuItemOption(R.string.saved_item_context_menu_action_edit_info, SavedItemAction.EditInfo),
        MenuItemOption(
            R.string.saved_item_context_menu_action_edit_labels,
            SavedItemAction.EditLabels
        ),
        MenuItemOption(
            textResourceId = if (isArchived) R.string.saved_item_context_menu_action_unarchive else R.string.saved_item_context_menu_action_archive,
            action = if (isArchived) SavedItemAction.Unarchive else SavedItemAction.Archive
        ),
        MenuItemOption(
            textResourceId = R.string.saved_item_context_menu_action_share_original,
            customAction = {
                webReaderViewModel.showShareLinkSheet(context)
                onDismiss()
            }
        ),
        MenuItemOption(R.string.saved_item_context_menu_action_remove_item, SavedItemAction.Delete)
    )

    DropdownMenu(
        expanded = isExpanded,
        onDismissRequest = onDismiss
    ) {
        menuOptions.forEach { option ->
            if (option.customAction != null) {
                DropdownMenuItem(
                    text = { Text( text = stringResource(option.textResourceId), fontWeight = FontWeight.Normal) },
                    onClick = {
                        option.customAction.invoke()
                    }
                )
            } else {
                DropdownMenuItem(
                    text = { Text( text = stringResource(option.textResourceId), fontWeight = FontWeight.Normal) },
                    onClick = {
                        option.action?.let { actionHandler(it) }
                        onDismiss()
                    }
                )
            }
        }
    }
}

data class MenuItemOption(
    val textResourceId: Int,
    val action: SavedItemAction? = null,
    val customAction: (() -> Unit)? = null
)
