package app.omnivore.omnivore.ui.components

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LabelCreationDialog(onDismiss: () -> Unit, onSave: () -> Unit) {
  var labelName by rememberSaveable { mutableStateOf("") }
  val focusManager = LocalFocusManager.current

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
              Text(text = "Cancel")
            }

            Text("Create New Label", fontWeight = FontWeight.ExtraBold)

            TextButton(onClick = { onSave() }) {
              Text(text = "Create")
            }
          }

          Row(
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .fillMaxWidth()
          ) {
            Text("Assign a name and color.")
          }

          Row(
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .fillMaxWidth()
          ) {
            OutlinedTextField(
              value = labelName,
              placeholder = { Text(text = "Label Name") },
              onValueChange = { labelName = it },
              keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
              keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
            )
          }

          Row(
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .fillMaxWidth()
          ) {
            Text("Add a color grid here.")
          }
        }
      }
    }
  }
}
