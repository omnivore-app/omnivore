package app.omnivore.omnivore.feature.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyHorizontalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import app.omnivore.omnivore.R

@Composable
fun LabelCreationDialog(onDismiss: () -> Unit, onSave: (String, String) -> Unit) {
  var labelName by rememberSaveable { mutableStateOf("") }
  val focusManager = LocalFocusManager.current
  val swatchHexes = LabelSwatchHelper.allHexes()
  var selectedHex by rememberSaveable { mutableStateOf(swatchHexes.first()) }

  Dialog(onDismissRequest = { onDismiss() }) {
    Surface(
      modifier = Modifier
        .fillMaxSize()
    ) {
      Surface(
        modifier = Modifier
          .fillMaxSize()
          .background(MaterialTheme.colorScheme.background),
        shape = RoundedCornerShape(16.dp)
      ) {

        Column(
          verticalArrangement = Arrangement.Top,
          horizontalAlignment = Alignment.CenterHorizontally,
          modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 6.dp)
        ) {
          Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .fillMaxWidth()
          ) {
            TextButton(onClick = onDismiss) {
              Text(text = stringResource(R.string.label_creation_action_cancel))
            }

            Text(stringResource(R.string.label_creation_title), fontWeight = FontWeight.ExtraBold)

            TextButton(onClick = { onSave(labelName, selectedHex) }) {
              Text(text = stringResource(R.string.label_creation_action_create))
            }
          }

          Row(
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .fillMaxWidth()
              .padding(vertical = 10.dp)
          ) {
            Text(stringResource(R.string.label_creation_content))
          }

          Row(
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .fillMaxWidth()
              .padding(bottom = 10.dp)
          ) {
            OutlinedTextField(
              value = labelName,
              placeholder = { Text(stringResource(R.string.label_creation_label_placeholder)) },
              onValueChange = { labelName = it },
              keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
              keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
            )
          }

          Row(
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.Top,
            modifier = Modifier
              .height(130.dp)
              .padding(10.dp)
          ) {
            LazyHorizontalGrid(
              rows = GridCells.Fixed(2),
              horizontalArrangement = Arrangement.spacedBy(10.dp),
              verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              items(swatchHexes) { hex ->
                val labelChipColors = LabelChipColors.fromHex(hex)
                val borderThickness = if (selectedHex == hex) 2.dp else 0.dp
                OutlinedButton(
                  onClick = { selectedHex = hex },
                  modifier= Modifier
                    .size(50.dp),
                  shape = CircleShape,
                  border= BorderStroke(borderThickness, Color.Black),
                  contentPadding = PaddingValues(0.dp),
                  colors = ButtonDefaults.outlinedButtonColors(containerColor = labelChipColors.containerColor),
                  content = {}
                )
              }
            }
          }
        }
      }
    }
  }
}

object LabelSwatchHelper {
  fun allHexes(): List<String> {
    val shuffledSwatches = swatchHexes.shuffled()
    return listOf(shuffledSwatches.last()) + webSwatchHexes + shuffledSwatches.dropLast(1)
  }

  fun random(): String {
    return webSwatchHexes.random()
  }

  private val webSwatchHexes = listOf(
    "#FF5D99",
    "#7CFF7B",
    "#FFD234",
    "#7BE4FF",
    "#CE88EF",
    "#EF8C43"
  )

  private val swatchHexes = listOf(
    "#fff034",
    "#efff34",
    "#d1ff34",
    "#b2ff34",
    "#94ff34",
    "#75ff34",
    "#57ff34",
    "#38ff34",
    "#34ff4e",
    "#34ff6d",
    "#34ff8b",
    "#34ffa9",
    "#34ffc8",
    "#34ffe6",
    "#34f9ff",
    "#34dbff",
    "#34bcff",
    "#349eff",
    "#347fff",
    "#3461ff",
    "#3443ff",
    "#4434ff",
    "#6234ff",
    "#8134ff",
    "#9f34ff",
    "#be34ff",
    "#dc34ff",
    "#fb34ff",
    "#ff34e5",
    "#ff34c7",
    "#ff34a8",
    "#ff348a",
    "#ff346b"
  )
}
