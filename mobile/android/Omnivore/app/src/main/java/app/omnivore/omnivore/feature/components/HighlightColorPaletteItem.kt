package app.omnivore.omnivore.feature.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun HighlightColorPaletteItem(
    modifier: Modifier = Modifier,
    color: HighlightColor,
    isSelected: Boolean,
    onClick: (color: HighlightColor) -> Unit,
) {
    Column (
        modifier = modifier.padding(6.dp),
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(color.color)
                .clickable { onClick(color) }
        )
        {
            if (isSelected) {
                Icon(
                    Icons.Rounded.Check,
                    contentDescription = "checkIcon",
                    tint = Color.DarkGray,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }
    }
}
