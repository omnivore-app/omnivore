package app.omnivore.omnivore.ui.savedItemViews

import android.content.Context
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.List
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
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
      text = { Text("Edit Labels") },
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
      text = { Text(if (isArchived) "Unarchive" else "Archive") },
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
      text = { Text("Share Original") },
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
      text = { Text("Remove Item") },
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
