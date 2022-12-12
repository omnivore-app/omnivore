package app.omnivore.omnivore.ui.home

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.List
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.omnivore.omnivore.models.LinkedItem
import coil.compose.rememberAsyncImagePainter

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun LinkedItemCard(item: LinkedItem, onClickHandler: () -> Unit, actionHandler: (LinkedItemAction) -> Unit) {
  var isMenuExpanded by remember { mutableStateOf(false) }
  val publisherDisplayName = item.publisherDisplayName()

  Column {
    Row(
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.Top,
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp)
        .combinedClickable(
          onClick = onClickHandler,
          onLongClick = { isMenuExpanded = true }
        )
        .background(if (isMenuExpanded) Color.LightGray else Color.Transparent)
    ) {
      Column(
        verticalArrangement = Arrangement.spacedBy(2.dp),
        modifier = Modifier
          .weight(1f, fill = false)
          .padding(end = 8.dp)
      ) {
        Text(
          text = item.title,
          style = MaterialTheme.typography.titleMedium,
          lineHeight = 20.sp
        )

        if (item.author != null) {
          Text(
            text = "By ${item.author}",
            style = MaterialTheme.typography.bodyMedium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }

        if (publisherDisplayName != null) {
          Text(
            text = publisherDisplayName,
            style = MaterialTheme.typography.bodyMedium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }
      }

      if (item.imageURLString != null) {
        Image(
          painter = rememberAsyncImagePainter(item.imageURLString),
          contentDescription = "Image associated with linked item",
          modifier = Modifier
            .padding(top = 6.dp)
            .clip(RoundedCornerShape(6.dp))
            .size(80.dp)
        )
      }
    }

    Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)

    DropdownMenu(
      expanded = isMenuExpanded,
      onDismissRequest = { isMenuExpanded = false }
    ) {
      DropdownMenuItem(
        text = { Text("Archive") },
        onClick = {
          actionHandler(LinkedItemAction.Archive)
          isMenuExpanded = false
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
          isMenuExpanded = false
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
}
