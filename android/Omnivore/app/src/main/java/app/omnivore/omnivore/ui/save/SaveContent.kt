package app.omnivore.omnivore.ui.save

import android.content.Intent
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.material.*
import androidx.compose.material.ButtonDefaults
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.MainActivity
import app.omnivore.omnivore.ui.reader.PDFReaderActivity
import app.omnivore.omnivore.ui.reader.WebReaderLoadingContainerActivity
import kotlinx.coroutines.launch

@Composable
@OptIn(ExperimentalMaterialApi::class)
fun SaveContent(viewModel: SaveViewModel, modalBottomSheetState: ModalBottomSheetState, modifier: Modifier) {
  val coroutineScope = rememberCoroutineScope()
  val context = LocalContext.current
  val enableReadNow = false

  Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
    Column(
      verticalArrangement = Arrangement.SpaceBetween,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier
        .background(MaterialTheme.colors.background)
        .fillMaxSize()
        .padding(top = 48.dp, bottom = 32.dp)
    ) {
      Text(text = viewModel.message ?: "Saving")
      Row {
        if (enableReadNow) {
          Button(
            onClick = {
              coroutineScope.launch {
                modalBottomSheetState.hide()
                viewModel.clientRequestID?.let {
                  val intent = Intent(context, WebReaderLoadingContainerActivity::class.java)
                  intent.putExtra("SAVED_ITEM_REQUEST_ID", it)
                  context.startActivity(intent)
                }
              }
            },
            colors = ButtonDefaults.buttonColors(
              contentColor = Color(0xFF3D3D3D),
              backgroundColor = Color.White
            )
          ) {
            Text(text = "Read Now")
          }

          Spacer(modifier = Modifier.width(8.dp))
        }

        Button(
          onClick = {
            coroutineScope.launch {
              modalBottomSheetState.hide()
            }
          },
          colors = ButtonDefaults.buttonColors(
            contentColor = Color(0xFF3D3D3D),
            backgroundColor = Color(0xffffd234)
          )
        ) {
          Text(text = if (enableReadNow) "Read Later" else "Dismiss")
        }
      }
    }
  }
}


