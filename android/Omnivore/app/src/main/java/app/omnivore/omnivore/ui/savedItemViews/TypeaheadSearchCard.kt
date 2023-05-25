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
import app.omnivore.omnivore.persistence.entities.TypeaheadCardData
import app.omnivore.omnivore.ui.components.LabelChipColors
import app.omnivore.omnivore.ui.library.SavedItemAction
import coil.compose.rememberAsyncImagePainter

@OptIn(ExperimentalFoundationApi::class, ExperimentalMaterial3Api::class,
)
@Composable
fun TypeaheadSearchCard(cardData: TypeaheadCardData, onClickHandler: () -> Unit, actionHandler: (SavedItemAction) -> Unit) {
    Column(
        modifier = Modifier
            .combinedClickable(
                onClick = onClickHandler,
            )
    ) {
        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top,
            modifier = Modifier
                .fillMaxWidth()
                .padding(15.dp)
                .background(Color.Transparent)
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

            }
        }

        Divider(color = MaterialTheme.colorScheme.outlineVariant, thickness = 1.dp)
    }
}
