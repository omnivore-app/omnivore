import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.ui.components.HighlightColor
import app.omnivore.omnivore.ui.components.HighlightColorPaletteMode

@Composable
fun HighlightColorPalette(
    mode: HighlightColorPaletteMode = HighlightColorPaletteMode.Light,
    selectedColorName: String,
    onColorSelected: (color: HighlightColor) -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        color = mode.backgroundColor,
        shadowElevation = 9.dp
    ) {
        Row(modifier = Modifier.padding(8.dp, 2.dp, 8.dp, 2.dp)) {
            HighlightColorPaletteItem(
                color = HighlightColor(name = "yellow", Color(0xFFFFD234)),
                isSelected = "yellow" == selectedColorName,
                onClick = onColorSelected
            )
            HighlightColorPaletteItem(
                color = HighlightColor(name = "red", Color(0xFFFB9A9A)),
                isSelected = "red" == selectedColorName,
                onClick = onColorSelected
            )
            HighlightColorPaletteItem(
                color = HighlightColor(name = "green", Color(0xFF55C689)),
                isSelected = "green" == selectedColorName,
                onClick = onColorSelected
            )
            HighlightColorPaletteItem(
                color = HighlightColor(name = "blue", Color(0xFF6AB1FF)),
                isSelected = "blue" == selectedColorName,
                onClick = onColorSelected
            )
        }
    }
}
