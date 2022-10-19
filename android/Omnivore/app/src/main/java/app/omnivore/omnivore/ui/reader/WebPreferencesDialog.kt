package app.omnivore.omnivore.ui.reader

import android.util.Log
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Switch
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
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
        .height(300.dp)
    ) {
      WebPreferencesView(webReaderViewModel)
    }
  }
}

@Composable
fun WebPreferencesView(webReaderViewModel: WebReaderViewModel) {
  val currentWebPreferences = webReaderViewModel.storedWebPreferences()
  val isFontListExpanded = remember { mutableStateOf(false) }
  val highContrastTextSwitchState = remember { mutableStateOf(currentWebPreferences.prefersHighContrastText) }
  val selectedWebFontRawValue = remember { mutableStateOf(currentWebPreferences.fontFamily.rawValue) }

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
      Stepper(
        label = "Font Size:",
        onIncrease = { webReaderViewModel.updateFontSize(isIncrease = true) },
        onDecrease = { webReaderViewModel.updateFontSize(isIncrease = false) }
      )

      Stepper(
        label = "Margin:",
        onIncrease = { webReaderViewModel.updateMaxWidthPercentage(isIncrease = false) },
        onDecrease = { webReaderViewModel.updateMaxWidthPercentage(isIncrease = true) }
      )

      Stepper(
        label = "Line Spacing:",
        onIncrease = { webReaderViewModel.updateLineSpacing(isIncrease = true) },
        onDecrease = { webReaderViewModel.updateLineSpacing(isIncrease = false) }
      )

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

      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
          .clickable(onClick = { isFontListExpanded.value = !isFontListExpanded.value })
      ) {
        Text("Font Family")
        Spacer(modifier = Modifier.weight(1.0F))
        Icon(
          imageVector =
          if (isFontListExpanded.value)
            Icons.Filled.KeyboardArrowDown
          else
            Icons.Filled.KeyboardArrowRight,
          contentDescription = null
        )
      }

      if (isFontListExpanded.value) {
        WebFont.values().forEach {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .clickable(onClick = {
                selectedWebFontRawValue.value = it.rawValue
                webReaderViewModel.applyWebFont(it)
              })
          ) {
            Text(
              it.displayText,
              modifier = Modifier
                .padding(top = 6.dp, start = 6.dp, end = 6.dp, bottom = 6.dp)
            )
            Spacer(modifier = Modifier.weight(1.0F))
            if (it.rawValue == selectedWebFontRawValue.value) {
              Icon(
                imageVector = Icons.Filled.Check,
                contentDescription = null
              )
            }
          }
        }
      }
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
