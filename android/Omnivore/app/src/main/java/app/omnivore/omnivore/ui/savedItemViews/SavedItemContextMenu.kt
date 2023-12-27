package app.omnivore.omnivore.ui.savedItemViews

import android.content.Context
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.List
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.library.SavedItemAction
import app.omnivore.omnivore.ui.reader.WebReaderViewModel

@Composable
fun SavedItemContextMenu(
  isExpanded: Boolean,
  isArchived: Boolean,
  context: Context,
  webReaderViewModel: WebReaderViewModel,
  onDismiss: () -> Unit,
  actionHandler: (SavedItemAction) -> Unit
) {
  DropdownMenu(
    expanded = isExpanded,
    onDismissRequest = onDismiss
  ) {
    DropdownMenuItem(
      text = { Text(stringResource(R.string.saved_item_context_menu_action_edit_info)) },
      onClick = {
        actionHandler(SavedItemAction.EditInfo)
        onDismiss()
      },
      leadingIcon = {
        Icon(
          Icons.Outlined.Info,
          contentDescription = null
        )
      }
    )
    DropdownMenuItem(
      text = { Text(stringResource(R.string.saved_item_context_menu_action_edit_labels)) },
      onClick = {
        actionHandler(SavedItemAction.EditLabels)
        onDismiss()
      },
      leadingIcon = {
        Icon(
          painter = painterResource(id = R.drawable.tag),
          contentDescription = null
        )
      }
    )
    DropdownMenuItem(
      text = { Text(if (isArchived)
        stringResource(R.string.saved_item_context_menu_action_unarchive) else
        stringResource(R.string.saved_item_context_menu_action_archive)) },
      onClick = {
        val action = if (isArchived) SavedItemAction.Unarchive else SavedItemAction.Archive
        actionHandler(action)
        onDismiss()
      },
      leadingIcon = {
        Icon(
          painter = painterResource(id = R.drawable.archive_outline),
          contentDescription = null
        )
      }
    )
    DropdownMenuItem(
      text = { Text(stringResource(R.string.saved_item_context_menu_action_share_original)) },
      onClick = {
        webReaderViewModel.showShareLinkSheet(context)
        onDismiss()
      },
      leadingIcon = {
        Icon(
          Icons.Outlined.Share,
          contentDescription = null
        )
      }
    )
    DropdownMenuItem(
      text = { Text(stringResource(R.string.saved_item_context_menu_action_remove_item)) },
      onClick = {
        actionHandler(SavedItemAction.Delete)
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
