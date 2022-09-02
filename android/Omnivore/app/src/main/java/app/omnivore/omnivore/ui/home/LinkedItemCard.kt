package app.omnivore.omnivore.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.Image
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LinkedItemCard(
  item: LinkedItem,
  onClickHandler: () -> Unit,
  modifier: Modifier = Modifier
) {
  Card(
    onClick = { onClickHandler() },
    shape = MaterialTheme.shapes.medium,
    modifier = modifier
      .fillMaxWidth()
      .padding(15.dp)
  ) {
    Row {
      Image(
        painter = rememberAsyncImagePainter(item.imageURLString),
        contentDescription = "Image associated with linked item",
        modifier = Modifier.size(100.dp)
      )

      Column(modifier = Modifier.padding(8.dp)) {
        Text(
          text = item.title,
          style = MaterialTheme.typography.titleMedium,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis
        )

        Text(
          text = item.descriptionText ?: "",
          maxLines = 1,
          overflow = TextOverflow.Ellipsis,
          style = MaterialTheme.typography.bodyMedium
        )
      }
    }
  }
}
