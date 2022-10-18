package app.omnivore.omnivore.ui.reader

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
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
  Column {
    Text("Web Preferences")
    // Font Size: Stepper
    Stepper(
      label = "Font Size:",
      onIncrease = {},
      onDecrease = {}
    )

    // Margin: Slider
    Stepper(
      label = "Margin:",
      onIncrease = {},
      onDecrease = {}
    )

    // Line Spacing: Slider
    Stepper(
      label = "Line Spacing:",
      onIncrease = {},
      onDecrease = {}
    )

    // High Contrast Text: Switch
    // Reader Font: List of Fonts
  }
}

@Composable
fun Stepper(label: String, onIncrease: () -> Unit, onDecrease: () -> Unit) {
  Row {
    Text(text = label)
    Spacer(modifier = Modifier.weight(1.0F))

    IconButton(onClick = { onDecrease() }) {
      Icon(
        imageVector = Icons.Filled.Add,
        contentDescription = null
      )
    }

    Divider(
      color = Color.Black,
      modifier = Modifier
        .height(40.dp)
        .width(1.dp)
    )

    IconButton(onClick = { onIncrease() }) {
      Icon(
        imageVector = Icons.Filled.Add,
        contentDescription = null
      )
    }
  }
}

data class WebPreferences(
  val textFontSize: Int,
  val lineHeight: Int,
  val maxWidthPercentage: Int,
  val themeKey: String,
  val fontFamily: WebFont,
  val prefersHighContrastText: Boolean
)
