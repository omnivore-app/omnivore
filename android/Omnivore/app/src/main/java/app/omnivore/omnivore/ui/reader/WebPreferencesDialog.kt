package app.omnivore.omnivore.ui.reader

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Switch
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import app.omnivore.omnivore.R

@Composable
fun WebPreferencesDialog(onDismiss: () -> Unit, webReaderViewModel: WebReaderViewModel) {
  Dialog(onDismissRequest = { onDismiss() }) {
    Surface(
      shape = RoundedCornerShape(16.dp),
      color = Color.White,
      modifier = Modifier
        .height(250.dp)
    ) {
      WebPreferencesView(webReaderViewModel)
    }
  }
}

@Composable
fun WebPreferencesView(webReaderViewModel: WebReaderViewModel) {
  val currentWebPreferences = webReaderViewModel.storedWebPreferences()
  val highContrastTextSwitchState = remember { mutableStateOf(currentWebPreferences.prefersHighContrastText) }

  Column(
    modifier = Modifier
      .padding(top = 6.dp, start = 6.dp, end = 6.dp, bottom = 6.dp)
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(top = 12.dp, bottom = 12.dp),
      horizontalArrangement = Arrangement.Center
    ) {
      Text("Web Preferences")
    }

    Column(
      modifier = Modifier
        .verticalScroll(rememberScrollState())
    ) {

      // Font Size: Stepper
      Stepper(
        label = "Font Size:",
        onIncrease = { webReaderViewModel.updateFontSize(isIncrease = true) },
        onDecrease = { webReaderViewModel.updateFontSize(isIncrease = false) }
      )

      // Margin: Slider
      Stepper(
        label = "Margin:",
        onIncrease = { webReaderViewModel.updateMaxWidthPercentage(isIncrease = false) },
        onDecrease = { webReaderViewModel.updateMaxWidthPercentage(isIncrease = true) }
      )

      // Line Spacing: Slider
      Stepper(
        label = "Line Spacing:",
        onIncrease = { webReaderViewModel.updateLineSpacing(isIncrease = true) },
        onDecrease = { webReaderViewModel.updateLineSpacing(isIncrease = false) }
      )

      // High Contrast Text: Switch
      Row(verticalAlignment = Alignment.CenterVertically) {
        Text("High Contrast Text")
        Spacer(modifier = Modifier.weight(1.0F))
        Switch(
          checked = highContrastTextSwitchState.value,
          onCheckedChange = {
            highContrastTextSwitchState.value = it
            webReaderViewModel.updateHighContrastTextPreference(it)
          }
        )
      }

      // Reader Font: List of Fonts
    }
  }
}

@Composable
fun Stepper(label: String, onIncrease: () -> Unit, onDecrease: () -> Unit) {
  Row(verticalAlignment = Alignment.CenterVertically) {
    Text(
      text = label,
      modifier = Modifier
        .padding(bottom = 6.dp)
    )

    Spacer(modifier = Modifier.weight(1.0F))

    IconButton(onClick = { onDecrease() }) {
      Icon(
        painter = painterResource(id = R.drawable.minus),
        contentDescription = null
      )
    }

    Divider(
      color = Color.Black,
      modifier = Modifier
        .height(20.dp)
        .width(1.dp)
    )

    IconButton(onClick = { onIncrease() }) {
      Icon(
        painter = painterResource(id = R.drawable.plus),
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
