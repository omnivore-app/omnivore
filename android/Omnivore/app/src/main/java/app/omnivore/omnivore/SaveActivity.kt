package app.omnivore.omnivore

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.ui.Modifier
import app.omnivore.omnivore.ui.theme.OmnivoreTheme

class SaveActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    var text: String? = null

    when (intent?.action) {
      Intent.ACTION_SEND -> {
        if (intent.type?.startsWith("text/") == true) {
          intent.getStringExtra(Intent.EXTRA_TEXT)?.let {
            text = it
          }
        }
      }
      else -> {
        // Handle other intents, such as being started from the home screen
      }
    }

    setContent {
      OmnivoreTheme {
        // A surface container using the 'background' color from the theme
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
          Text(text = text ?: "no text extracted")
        }
      }
    }
  }
}
