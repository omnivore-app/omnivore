package app.omnivore.omnivore.ui.components

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance

data class LabelChipColors(
  val textColor: Color,
  val containerColor: Color
) {
  companion object {
    fun fromHex(hex: String): LabelChipColors {
      val labelColor = Color(android.graphics.Color.parseColor(hex))

      return LabelChipColors(
        textColor = if (labelColor.luminance() > 0.5) Color.Black else Color.White,
        containerColor = labelColor
      )
    }
  }
}
