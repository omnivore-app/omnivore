package app.omnivore.omnivore

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.material.*
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
@OptIn(ExperimentalMaterialApi::class)
fun SaveContent(extractedText: String?, modalBottomSheetState: ModalBottomSheetState, modifier: Modifier) {
    val coroutineScope = rememberCoroutineScope()

    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
          Column(
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .background(MaterialTheme.colors.background)
                .fillMaxSize()
          ) {
              val authToken = "authToken"

              Text(text = extractedText ?: "no text extracted")
                Spacer(modifier = Modifier.height(16.dp))
              Text(text = authToken ?: "no auth token")

              Button(onClick = {
                  coroutineScope.launch {
                      modalBottomSheetState.hide()
                  }
              }) {
                  Text(text = "Dismiss")
              }
          }
    }
}

