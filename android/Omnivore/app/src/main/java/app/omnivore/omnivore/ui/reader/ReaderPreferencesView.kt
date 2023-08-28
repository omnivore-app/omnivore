package app.omnivore.omnivore.ui.reader

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.rememberLazyListState

import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Switch
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.ui.theme.OmnivoreTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderPreferencesView(webReaderViewModel: WebReaderViewModel) {
  val isDark = isSystemInDarkTheme()
  val currentWebPreferences = webReaderViewModel.storedWebPreferences(isDark)
  val isFontListExpanded = remember { mutableStateOf(false) }
  val highContrastTextSwitchState = remember { mutableStateOf(currentWebPreferences.prefersHighContrastText) }

  val justifyTextSwitchState = remember { mutableStateOf(currentWebPreferences.prefersJustifyText) }

  val selectedWebFontName = remember { mutableStateOf(currentWebPreferences.fontFamily.displayText) }


  var fontSizeSliderValue by remember { mutableStateOf(currentWebPreferences.textFontSize.toFloat()) }
  var marginSliderValue by remember { mutableStateOf(currentWebPreferences.maxWidthPercentage.toFloat()) }
  var lineSpacingSliderValue by remember { mutableStateOf(currentWebPreferences.lineHeight.toFloat()) }

  val themeState = remember { mutableStateOf(currentWebPreferences.storedThemePreference) }

  OmnivoreTheme() {
  Column(
    modifier = Modifier
      .padding(horizontal = 15.dp)
      .padding(vertical = 35.dp)
      .verticalScroll(rememberScrollState())
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 15.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Text("Font", style = TextStyle(
        fontSize = 15.sp,
        fontWeight = FontWeight.Normal,
        color = Color(red = 137, green = 137, blue = 137)
      ))
      Spacer(modifier = Modifier.weight(1.0F))
      Box {
        AssistChip(
          onClick = { isFontListExpanded.value = true },
          label = { Text(selectedWebFontName.value, color = Color(red = 137, green = 137, blue = 137)) },
          trailingIcon = {
            Icon(
              Icons.Default.ArrowDropDown,
              contentDescription = "Choose the Reader font",
              tint = Color(red = 137, green = 137, blue = 137)
            )
          },
        )
        if (isFontListExpanded.value) {
          DropdownMenu(
            expanded = isFontListExpanded.value,
            onDismissRequest = { isFontListExpanded.value = false },
          ) {
            WebFont.values().forEach {
              DropdownMenuItem(
                text = {
                  Text(it.displayText, style = TextStyle(
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(red = 137, green = 137, blue = 137)
                  ))
                },
                onClick = {
                  webReaderViewModel.applyWebFont(it)
                  selectedWebFontName.value = it.displayText
                  isFontListExpanded.value = false
                },
              )
            }
          }
        }
      }
    }

    Text("Font Size:", style = TextStyle(
      fontSize = 15.sp,
      fontWeight = FontWeight.Normal,
      color = Color(red = 137, green = 137, blue = 137)
    ))
    Slider(
      value = fontSizeSliderValue,
      onValueChange = {
        fontSizeSliderValue = it
        webReaderViewModel.setFontSize(it.toInt())
      },
      steps = 10,
      valueRange = 10f..48f,
    )

    Text("Margin", style = TextStyle(
      fontSize = 15.sp,
      fontWeight = FontWeight.Normal,
      color = Color(red = 137, green = 137, blue = 137)
    ))
    Slider(
      value = marginSliderValue,
      onValueChange = {
        marginSliderValue = it
        webReaderViewModel.setMaxWidthPercentage(it.toInt())
      },
      steps = 4,
      valueRange = 60f..100f,
    )

    Text("Line Spacing", style = TextStyle(
      fontSize = 15.sp,
      fontWeight = FontWeight.Normal,
      color = Color(red = 137, green = 137, blue = 137)
    ))
    Slider(
      value = lineSpacingSliderValue,
      onValueChange = {
        lineSpacingSliderValue = it
        webReaderViewModel.setLineHeight(it.toInt())
      },
      steps = 8,
      valueRange = 100f..300f,
    )

    Row(
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier
        .padding(vertical = 4.dp)
    ) {
      Text("Theme:", style = TextStyle(
        fontSize = 15.sp,
        fontWeight = FontWeight.Normal,
        color = Color(red = 137, green = 137, blue = 137)
      ))
      Spacer(modifier = Modifier.weight(1.0F))
      Text("Auto", style = TextStyle(
        fontSize = 10.sp,
        fontWeight = FontWeight.Normal,
        color = Color(red = 137, green = 137, blue = 137)
      ))
      Checkbox(
        checked = themeState.value == "System",
        onCheckedChange = {
          if (it) {
            themeState.value = "System"
            webReaderViewModel.updateStoredThemePreference("System", isDark)
          } else {
            val newThemeKey = if (isDark) "Black" else "Light"
            themeState.value = newThemeKey
            webReaderViewModel.updateStoredThemePreference(newThemeKey, isDark)
          }
        })
    }
    Row(
      modifier = Modifier
        .fillMaxWidth(),
      horizontalArrangement = Arrangement.Start,
    ) {
      for(theme in Themes.values()) {
        if (theme.themeKey != "System") {
          val isSelected = theme.themeKey == themeState.value
          Button(
            onClick = {
              themeState.value = theme.themeKey
              webReaderViewModel.updateStoredThemePreference(theme.themeKey, isDark)
            },
            shape = CircleShape,
            border = BorderStroke(3.dp, if (isSelected) colorResource(R.color.cta_yellow) else Color.Transparent),
            modifier = Modifier.size(35.dp),
            colors = ButtonDefaults.buttonColors(

              containerColor = Color(theme.backgroundColor)
            )
          ) {

          }
          Spacer(modifier = Modifier.weight(0.1F))
        }

      }
      Spacer(modifier = Modifier.weight(2.0F))
    }

    Row(verticalAlignment = Alignment.CenterVertically) {
      Text("High Contrast Text",
        style = TextStyle(
        fontSize = 15.sp,
        fontWeight = FontWeight.Normal,
        color = Color(red = 137, green = 137, blue = 137)
      ))
      Spacer(modifier = Modifier.weight(1.0F))
      Switch(
        checked = highContrastTextSwitchState.value,
        onCheckedChange = {
          highContrastTextSwitchState.value = it
          webReaderViewModel.updateHighContrastTextPreference(it)
        }
      )
    }

    Row(verticalAlignment = Alignment.CenterVertically) {
      Text("Justify Text",
        style = TextStyle(
          fontSize = 15.sp,
          fontWeight = FontWeight.Normal,
          color = Color(red = 137, green = 137, blue = 137))
      )
      Spacer(modifier = Modifier.weight(1.0F))
      Switch(
        checked = justifyTextSwitchState.value,
        onCheckedChange = {
          justifyTextSwitchState.value = it
          webReaderViewModel.updateJustifyText(it)
        }
      )
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
  val storedThemePreference: String,
  val fontFamily: WebFont,
  val prefersHighContrastText: Boolean,
  val prefersJustifyText: Boolean
)
