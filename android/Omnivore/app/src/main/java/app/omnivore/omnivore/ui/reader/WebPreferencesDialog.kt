package app.omnivore.omnivore.ui.reader

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Text
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog

@Composable
fun WebPreferencesDialog(onDismiss: () -> Unit) {
  Dialog(onDismissRequest = { onDismiss() }) {
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = Color.White
    ) {
      WebPreferencesView()
    }
  }
}

@Composable
fun WebPreferencesView() {
  Text("Web Prefs")
}

data class WebPreferences(
  val textFontSize: Int,
  val lineHeight: Int,
  val maxWidthPercentage: Int,
  val themeKey: String,
  val fontFamily: WebFont,
  val prefersHighContrastText: Boolean
)
