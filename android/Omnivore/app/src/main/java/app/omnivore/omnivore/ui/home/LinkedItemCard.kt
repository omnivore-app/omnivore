package app.omnivore.omnivore.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.omnivore.omnivore.models.LinkedItem
import coil.compose.rememberAsyncImagePainter

@Composable
fun LinkedItemCard(item: LinkedItem, onClickHandler: () -> Unit) {
  val publisherDisplayName = item.publisherDisplayName()

  Column {
    Row(
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.Top,
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp)
        .clickable(onClick = onClickHandler)
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
  }
}
