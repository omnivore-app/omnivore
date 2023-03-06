package app.omnivore.omnivore.ui.components

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.window.Dialog

@Composable
fun LabelCreationDialog(onDismiss: () -> Unit, onSave: () -> Unit) {
  Dialog(onDismissRequest = { onDismiss() }) {
    Surface(
      modifier = Modifier
        .fillMaxSize()
    ) {
      Text("Add Label Dialog")
    }
  }
}
