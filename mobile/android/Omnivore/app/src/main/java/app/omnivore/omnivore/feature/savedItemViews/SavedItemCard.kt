package app.omnivore.omnivore.feature.savedItemViews

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.intl.Locale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.toLowerCase
import androidx.compose.ui.text.toUpperCase
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.feature.components.LabelChip
import app.omnivore.omnivore.feature.components.LabelChipColors
import app.omnivore.omnivore.feature.library.SavedItemViewModel
import coil.compose.rememberAsyncImagePainter

@OptIn(ExperimentalFoundationApi::class, ExperimentalLayoutApi::class)
@Composable
fun SavedItemCard(
    selected: Boolean,
    savedItemViewModel: SavedItemViewModel,
    savedItem: SavedItemWithLabelsAndHighlights,
    onClickHandler: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .combinedClickable(onClick = onClickHandler, onLongClick = {
                savedItemViewModel.actionsMenuItemLiveData.postValue(savedItem)
            })
            .background(if (selected) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.background)
            .fillMaxWidth()
    ) {
        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .background(Color.Transparent)

        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(5.dp, Alignment.CenterVertically),
                modifier = Modifier
                    .weight(1f, fill = false)
                    .defaultMinSize(minHeight = 50.dp)
            ) {
                ReadInfo(item = savedItem)

                Text(
                    text = savedItem.savedItem.title, style = TextStyle(
                        fontSize = 18.sp,
                        color = MaterialTheme.colorScheme.onBackground,
                        fontWeight = FontWeight.SemiBold
                    ), maxLines = 2, lineHeight = 20.sp
                )

                if (savedItem.savedItem.author != null && savedItem.savedItem.author != "") {
                    Text(
                        text = byline(savedItem), style = TextStyle(
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(red = 137, green = 137, blue = 137)
                        ), maxLines = 1, overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Image(
                painter = rememberAsyncImagePainter(savedItem.savedItem.imageURLString),
                contentDescription = "Image associated with saved item",
                modifier = Modifier
                    .size(55.dp, 55.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .defaultMinSize(minWidth = 55.dp, minHeight = 55.dp)
            )
        }

        if (savedItem.labels.any { !isFlairLabel(it) }) {
            FlowRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, bottom = 16.dp, end = 16.dp)
            ) {
                savedItem.labels.filter { !isFlairLabel(it) }
                    .sortedWith(compareBy { it.name.toLowerCase(Locale.current) }).forEach { label ->
                        val chipColors = LabelChipColors.fromHex(label.color)

                        LabelChip(
                            modifier = Modifier.clickable { }, name = label.name, colors = chipColors
                        )
                    }
            }
        }

        HorizontalDivider(thickness = 1.dp, color = MaterialTheme.colorScheme.outlineVariant)
    }
}

fun byline(item: SavedItemWithLabelsAndHighlights): String {
    item.savedItem.author?.let {
        return item.savedItem.author
    }

    val publisherDisplayName = item.savedItem.publisherDisplayName()
    publisherDisplayName?.let {
        return publisherDisplayName
    }

    return ""
}

fun estimatedReadingTime(item: SavedItemWithLabelsAndHighlights): String {
    item.savedItem.wordsCount?.let {
        if (it > 0) {
            val readLen = kotlin.math.max(1, it / 235)
            return "$readLen MIN READ • "
        }
    }
    return ""
}

fun readingProgress(item: SavedItemWithLabelsAndHighlights): String {
    // If there is no wordsCount don't show progress because it will make no sense
    item.savedItem.wordsCount?.let {
        if (it > 0) {
            val intVal = item.savedItem.readingProgress.toInt()
            return "$intVal%"
        }
    }
    return ""
}


enum class FlairIcon(
    val rawValue: String, val sortOrder: Int
) {
    FEED("feed", 0), RSS("rss", 0), FAVORITE("favorite", 1), NEWSLETTER(
        "newsletter", 2
    ),
    RECOMMENDED("recommended", 3), PINNED("pinned", 4)
}

val FLAIR_ICON_NAMES = listOf("feed", "rss", "favorite", "newsletter", "recommended", "pinned")

fun isFlairLabel(label: SavedItemLabel): Boolean {
    return FLAIR_ICON_NAMES.contains(label.name.toLowerCase(Locale.current))
}

@Composable
fun flairIcons(item: SavedItemWithLabelsAndHighlights) {
    val labels = item.labels.filter { isFlairLabel(it) }.map {
        FlairIcon.valueOf(it.name.toUpperCase(Locale.current))
    }
    labels.forEach {
        when (it) {
            FlairIcon.RSS, FlairIcon.FEED -> {
                Image(
                    painter = painterResource(id = R.drawable.flair_feed),
                    contentDescription = "Feed flair Icon",
                    modifier = Modifier.padding(end = 5.0.dp)
                )
            }

            FlairIcon.FAVORITE -> {
                Image(
                    painter = painterResource(id = R.drawable.flaire_favorite),
                    contentDescription = "Favorite flair Icon",
                    modifier = Modifier.padding(end = 5.0.dp)
                )
            }

            FlairIcon.NEWSLETTER -> {
                Image(
                    painter = painterResource(id = R.drawable.flair_newsletter),
                    contentDescription = "Newsletter flair Icon",
                    modifier = Modifier.padding(end = 5.0.dp)
                )
            }

            FlairIcon.RECOMMENDED -> {
                Image(
                    painter = painterResource(id = R.drawable.flair_recommended),
                    contentDescription = "Recommended flair Icon",
                    modifier = Modifier.padding(end = 5.0.dp)
                )
            }

            FlairIcon.PINNED -> {
                Image(
                    painter = painterResource(id = R.drawable.flair_pinned),
                    contentDescription = "Pinned flair Icon",
                    modifier = Modifier.padding(end = 5.0.dp)
                )
            }

        }
    }
}

@Composable
fun ReadInfo(item: SavedItemWithLabelsAndHighlights) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = 15.dp)
    ) {
        // Show flair here
        flairIcons(item)

        Text(
            text = estimatedReadingTime(item), style = TextStyle(
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(red = 137, green = 137, blue = 137)
            ), maxLines = 1, overflow = TextOverflow.Ellipsis
        )

        Text(
            text = readingProgress(item), style = TextStyle(
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = if (item.savedItem.readingProgress > 1) colorResource(R.color.green_55B938) else colorResource(
                    R.color.gray_898989
                )
            ), maxLines = 1, overflow = TextOverflow.Ellipsis
        )
    }
}
