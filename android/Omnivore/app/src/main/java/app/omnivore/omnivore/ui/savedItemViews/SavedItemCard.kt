package app.omnivore.omnivore.ui.savedItemViews

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.material3.SuggestionChipDefaults.elevatedSuggestionChipColors
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.components.LabelChipColors
import app.omnivore.omnivore.ui.library.SavedItemAction
import coil.compose.rememberAsyncImagePainter

@OptIn(ExperimentalFoundationApi::class, ExperimentalMaterial3Api::class,
)
@Composable
fun SavedItemCard(cardData: SavedItemCardData, labels: List<SavedItemLabel>, onClickHandler: () -> Unit, actionHandler: (SavedItemAction) -> Unit) {
  var isMenuExpanded by remember { mutableStateOf(false) }
  val publisherDisplayName = cardData.publisherDisplayName()
  val listState = rememberLazyListState()

  Column(
    modifier = Modifier
      .combinedClickable(
        onClick = onClickHandler,
        onLongClick = { isMenuExpanded = true }
      )
  ) {
    Row(
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.Top,
      modifier = Modifier
        .fillMaxWidth()
        .padding(15.dp)
        .background(if (isMenuExpanded) Color.LightGray else Color.Transparent)
    ) {
      Column(
        verticalArrangement = Arrangement.spacedBy(5.dp),
        modifier = Modifier
          .weight(1f, fill = false)
          .padding(end = 20.dp)
          .defaultMinSize(minHeight = 55.dp)
      ) {
        Text(
          text = cardData.title,
          style = TextStyle(
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold
          ),
          maxLines = 2,
          lineHeight = 20.sp
        )

        if (cardData.author != null && cardData.author != "") {
          Text(
            text = byline(cardData),
            style = MaterialTheme.typography.bodyMedium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }
//
//        if (publisherDisplayName != null) {
//          Text(
//            text = publisherDisplayName,
//            style = MaterialTheme.typography.bodyMedium,
//            maxLines = 1,
//            overflow = TextOverflow.Ellipsis
//          )
//        }
      }

      if (cardData.imageURLString != null) {
        Image(
          painter = rememberAsyncImagePainter(cardData.imageURLString),
          contentDescription = "Image associated with saved item",
          modifier = Modifier
            .size(55.dp, 73.dp)
            .clip(RoundedCornerShape(4.dp))
        )
      }
    }

    LazyRow(
      state = listState,
      horizontalArrangement = Arrangement.Start,
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier
        .padding(start = 5.dp)
    ) {
      items(labels.sortedBy { it.name }) { label ->
        val chipColors = LabelChipColors.fromHex(label.color)

        SuggestionChip(
          onClick = onClickHandler,
          label = { Text(label.name) },
          border = null,
          colors = elevatedSuggestionChipColors(
            containerColor = chipColors.containerColor,
            labelColor = chipColors.textColor,
            iconContentColor = chipColors.textColor
          ),
          modifier = Modifier
            .padding(horizontal = 4.dp)
        )
      }
    }

    Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)

    SavedItemContextMenu(
      isExpanded = isMenuExpanded,
      isArchived = cardData.isArchived,
      onDismiss = { isMenuExpanded = false },
      actionHandler = actionHandler
    )
  }
}

fun byline(item: SavedItemCardData): String {
  item.author?.let {
    return item.author
  }

  val publisherDisplayName = item.publisherDisplayName()
  publisherDisplayName?.let {
    return publisherDisplayName
  }

  return ""
}
