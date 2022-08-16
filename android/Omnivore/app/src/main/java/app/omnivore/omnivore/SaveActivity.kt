package app.omnivore.omnivore

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SaveActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val viewModel: SaveViewModel by viewModels()
    var extractedText: String? = null
    val authToken = viewModel.getAuthToken()

    when (intent?.action) {
      Intent.ACTION_SEND -> {
        if (intent.type?.startsWith("text/plain") == true) {
          intent.getStringExtra(Intent.EXTRA_TEXT)?.let {
            extractedText = it
            viewModel.saveURL(it)
          }
        }

        if (intent.type?.startsWith("text/html") == true) {
          intent.getStringExtra(Intent.EXTRA_HTML_TEXT)?.let {
            extractedText = it
          }
        }
      }
      else -> {
        // Handle other intents, such as being started from the home screen
      }
    }

    setContent {
      OmnivoreTheme {
//dialog()
//        saveBottomModal()
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
          Column(
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
              .background(MaterialTheme.colors.background)
              .fillMaxSize()
          ) {
            Text(text = extractedText ?: "no text extracted")
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = authToken ?: "no auth token")
          }
        }
      }
    }
  }
}

@Composable
fun dialog() {
  AlertDialog(
    onDismissRequest = {
      // Dismiss the dialog when the user clicks outside the dialog or on the back
      // button. If you want to disable that functionality, simply use an empty
      // onCloseRequest.
//      openDialog.value = false
    },
    title = {
      Text(text = "Dialog Title")
    },
    text = {
      Text("Here is a text ")
    },
    confirmButton = {
      Button(
        onClick = {
//          openDialog.value = false
        }) {
        Text("This is the Confirm Button")
      }
    },
    dismissButton = {
      Button(
        onClick = {
//          openDialog.value = false
        }) {
        Text("This is the dismiss Button")
      }
    }
  )
}

@OptIn(ExperimentalMaterialApi::class)
@Composable
fun saveBottomModal() {
  val scaffoldState = rememberScaffoldState()
  val modalBottomSheetState = rememberModalBottomSheetState(ModalBottomSheetValue.HalfExpanded)
  val coroutineScope = rememberCoroutineScope()

  Scaffold(
    scaffoldState = scaffoldState,
  ) { innerPadding ->
    Box(modifier = Modifier.padding(innerPadding)) {
      Button(onClick = {
        coroutineScope.launch {
          modalBottomSheetState.show()
        }
      }) {
        Text(text = "Show")
      }
    }
  }

  ModalBottomSheetLayout(
    sheetState = modalBottomSheetState,
    sheetContent = {
      LazyColumn {
        item {
          TextButton(modifier = Modifier.fillMaxWidth(), onClick = {
            // do something
          }) {
            Row {
              Icon(
                imageVector = Icons.Filled.Add,
                // painterResource(id = R.drawable.ic_baseline_add_24),
                contentDescription = "New Album"
              )
              Text("New Album")
              Spacer(modifier = Modifier.weight(1f))
            }
          }
        }
      }
    }
  ) {
    //
  }
}

