package app.omnivore.omnivore.feature.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun HighlightColorPalette(
    modifier: Modifier = Modifier,
    mode: HighlightColorPaletteMode = HighlightColorPaletteMode.Light,
    selectedColorName: String,
    onColorSelected: (color: HighlightColor) -> Unit,
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        color = mode.backgroundColor,
        shadowElevation = 9.dp
    ) {
        Row(modifier = Modifier.padding(8.dp, 2.dp, 8.dp, 2.dp)) {
            HighlightColorPaletteItem(
                color = HighlightColor(name = "orange", Color(0xC0FFAD5B)),
                isSelected = "orange" == selectedColorName,
                onClick = onColorSelected
            )
            HighlightColorPaletteItem(
                color = HighlightColor(name = "green", Color(0xC030F230)),
                isSelected = "green" == selectedColorName,
                onClick = onColorSelected
            )
            HighlightColorPaletteItem(
                color = HighlightColor(name = "red", Color(0xC0FC3636)),
                isSelected = "red" == selectedColorName,
                onClick = onColorSelected
            )
            HighlightColorPaletteItem(
                color = HighlightColor(name = "yellow", Color(0xC0FFFF26)),
                isSelected = "yellow" == selectedColorName,
                onClick = onColorSelected
            )
            HighlightColorPaletteItem(
                color = HighlightColor(name = "blue", Color(0xC0B7D0E5)),
                isSelected = "blue" == selectedColorName,
                onClick = onColorSelected
            )
            HighlightColorPaletteItem(
                color = HighlightColor(name = "pink", Color(0xC0F9C7F9)),
                isSelected = "pink" == selectedColorName,
                onClick = onColorSelected
            )
        }
    }
}
