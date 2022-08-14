package app.omnivore.omnivore

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import dagger.hilt.android.AndroidEntryPoint

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
