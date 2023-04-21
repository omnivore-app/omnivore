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
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import app.omnivore.omnivore.R
import app.omnivore.omnivore.persistence.entities.SavedItemCardData
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.ui.components.LabelChipColors
import app.omnivore.omnivore.ui.library.LibraryViewModel
import app.omnivore.omnivore.ui.library.SavedItemAction
import app.omnivore.omnivore.ui.library.SavedItemViewModel
import coil.compose.rememberAsyncImagePainter

@OptIn(ExperimentalFoundationApi::class, ExperimentalMaterial3Api::class,
)
@Composable
fun SavedItemCard(savedItemViewModel: SavedItemViewModel, cardData: SavedItemCardData, labels: List<SavedItemLabel>, onClickHandler: () -> Unit, actionHandler: (SavedItemAction) -> Unit) {
  val listState = rememberLazyListState()

  val actionsMenuItem: SavedItemCardData? by savedItemViewModel.actionsMenuItemLiveData.observeAsState(null)
  var isFocused = actionsMenuItem?.savedItemId == cardData.savedItemId


  Column(
    modifier = Modifier
      .combinedClickable(
        onClick = onClickHandler,
        onLongClick = { savedItemViewModel.actionsMenuItemLiveData.postValue(cardData) }
      )
      .fillMaxWidth()
  ) {
    Row(
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.Top,
      modifier = Modifier
        .fillMaxWidth()
        .padding(10.dp)
        .background(Color.Transparent)
    ) {
      Column(
        verticalArrangement = Arrangement.spacedBy(5.dp),
        modifier = Modifier
          .weight(1f, fill = false)
          .padding(end = 20.dp)
          .defaultMinSize(minHeight = 55.dp)
      ) {
        readInfo(item = cardData)

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
            style = TextStyle(
              fontSize = 15.sp,
              fontWeight = FontWeight.Normal,
              color = Color(red = 137, green = 137, blue = 137)
            ),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
          )
        }
      }

      Image(
        painter = rememberAsyncImagePainter(cardData.imageURLString),
        contentDescription = "Image associated with saved item",
        modifier = Modifier
          .size(55.dp, 73.dp)
          .clip(RoundedCornerShape(10.dp))
          .defaultMinSize(minWidth = 55.dp, minHeight = 73.dp)
          .clip(RoundedCornerShape(10.dp))
      )
    }

    LazyRow(
      state = listState,
      horizontalArrangement = Arrangement.Start,
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier
        .padding(start = 10.dp, bottom = 5.dp, end = 10.dp)
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
          modifier = Modifier.padding(end = 5.dp)
        )

      }
    }

    Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)
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

//
//var readingSpeed: Int64 {
//  var result = UserDefaults.standard.integer(forKey: UserDefaultKey.userWordsPerMinute.rawValue)
//  if result <= 0 {
//    result = 235
//  }
//  return Int64(result)
//}

fun estimatedReadingTime(item: SavedItemCardData): String {
  item.wordsCount?.let {
    if (it > 0) {
      val readLen = Math.max(1, it / 235)
      return "$readLen MIN READ • "
    }
  }
  return ""
}

fun readingProgress(item: SavedItemCardData): String {
  // If there is no wordsCount don't show progress because it will make no sense
  item.wordsCount?.let {
    if (it > 0) {
      val intVal = item.readingProgress.toInt()
      return "$intVal%"
    }
  }
  return ""
}

//var highlightsText: String {
//  item.hig ?.let {
//  if let highlights = item.highlights, highlights.count > 0 {
//    let fmted = LocalText.pluralizedText(key: "number_of_highlights", count: highlights.count)
//    if item.wordsCount > 0 {
//      return " • \(fmted)"
//    }
//    return fmted
//  }
//  return ""
//}
//
//var notesText: String {
//  let notes = item.highlights?.filter { item in
//          if let highlight = item as? Highlight {
//            return !(highlight.annotation ?? "").isEmpty
//          }
//    return false
//  }
//
//  if let notes = notes, notes.count > 0 {
//    let fmted = LocalText.pluralizedText(key: "number_of_notes", count: notes.count)
//    if item.wordsCount > 0 {
//      return " • \(fmted)"
//    }
//    return fmted
//  }
//  return ""
//}

@Composable
fun readInfo(item: SavedItemCardData) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .defaultMinSize(minHeight = 15.dp)
  ) {
    Text(
      text = estimatedReadingTime(item),
      style = TextStyle(
        fontSize = 11.sp,
        fontWeight = FontWeight.Medium,
        color = Color(red = 137, green = 137, blue = 137)
      ),
      maxLines = 1,
      overflow = TextOverflow.Ellipsis
    )

    Text(
      text = readingProgress(item),
      style = TextStyle(
        fontSize = 11.sp,
        fontWeight = FontWeight.Medium,
        color = if (item.readingProgress > 1) colorResource(R.color.green_55B938) else colorResource(R.color.gray_898989)
      ),
      maxLines = 1,
      overflow = TextOverflow.Ellipsis
    )

//    Text("\(highlightsText)")
//
//    Text("\(notesText)")

  }
}
